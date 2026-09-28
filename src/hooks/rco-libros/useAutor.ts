import { Autor } from "@/models/rco/autor";
import { ActualizarAutorLib, Autores, EliminarAutorLib, ListarAutorLib, NuevoAutorLib } from "@/Service/rco/AutorLib";
import apiClient from "@/Service/apiClient";
import { useCallback, useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";

export type AutorItem = Autor;

export interface UseAutorProps {
  visible?: boolean;
  setVisible?: (visible?: boolean) => void;
  onAutorCreado?: (autorNuevo: Autor) => void;
  onAutorActualizado?: (autorActualizado: Autor) => void;
  onAutorEliminado?: (id: number | string) => void;
}

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true
});

const normalizeUrl = (rawUrl: string): string => {
  try {
    let urlStr = rawUrl;
    if (urlStr.startsWith("http://") || urlStr.startsWith("https://")) {
      const parsed = new URL(urlStr);
      urlStr = `${parsed.pathname}${parsed.search}`;
    }
    if (urlStr.startsWith("/server.php/api/api/")) {
      urlStr = urlStr.replace(/^\/server\.php\/api\/api\//, "/api/");
    } else if (urlStr.startsWith("/server.php/api")) {
      urlStr = urlStr.replace(/^\/server\.php\/api/, "/api");
    } else if (urlStr.startsWith("/server.php")) {
      urlStr = urlStr.replace(/^\/server\.php/, "");
    }
    if (!urlStr.startsWith("/api")) {
      urlStr = `/api${urlStr.startsWith("/") ? "" : "/"}${urlStr}`;
    }
    return urlStr;
  } catch {
    return rawUrl;
  }
};

export const useAutor = ({
  visible: visibleProp,
  setVisible: setVisibleProp,
  onAutorCreado,
  onAutorActualizado,
  onAutorEliminado,
}: UseAutorProps = {}) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const isControlled = typeof visibleProp === "boolean";
  const isVisible = isControlled ? visibleProp : internalVisible;

  const [listaAutor, setListaAutor] = useState<Autor[]>([]);
  const [loadingAutor, setLoadingAutor] = useState(false);
  const [busquedaAutor, setBusquedaAutor] = useState("");
  const [autorSeleccionado, setAutorSeleccionado] = useState<Autor | null>(null);
  const [autorEnEdicion, setAutorEnEdicion] = useState<Autor | null>(null);

  const [nombreAutor, setNombreAutor] = useState("");
  const [guardando, setGuardando] = useState(false);

  const fetchAutor = useCallback(async () => {
    setLoadingAutor(true);
    try {
      const extractItems = (res: any): any[] => {
        if (!res) return [];
        if (Array.isArray(res)) return res;
        if (Array.isArray(res?.data)) return res.data;
        if (Array.isArray(res?.data?.data)) return res.data.data;
        if (Array.isArray(res?.autor)) return res.autor;
        if (Array.isArray(res?.autores)) return res.autores;
        if (Array.isArray(res?.autors)) return res.autors;
        return [];
      };

      let initialResponse: any = null;
      try {
        const resAutores = await Autores();
        const itemsAutores = extractItems(resAutores);
        initialResponse = resAutores;
        const lastPage = Number(resAutores?.last_page ?? resAutores?.meta?.last_page) || 1;
        if (lastPage > 1 || resAutores?.next_page_url) {
          try {
            const resListar = await ListarAutorLib();
            const itemsListar = extractItems(resListar);
            const lastPageListar = Number(resListar?.last_page ?? resListar?.meta?.last_page) || 1;
            if (lastPageListar === 1 && !resListar?.next_page_url && itemsListar.length > itemsAutores.length) {
              initialResponse = resListar;
            }
          } catch {
          }
        }
      } catch (err: any) {
        initialResponse = await ListarAutorLib();
      }

      let allRawItems: any[] = extractItems(initialResponse);
      let nextUrl =
        initialResponse?.next_page_url ||
        initialResponse?.links?.next ||
        initialResponse?.data?.next_page_url;

      let safetyCount = 0;
      while (nextUrl && safetyCount < 60) {
        safetyCount++;
        try {
          const targetUrl = normalizeUrl(nextUrl);
          const nextRes = await apiClient.get(targetUrl);
          const nextData = nextRes?.data;
          const pageItems = extractItems(nextData);
          if (pageItems.length > 0) {
            allRawItems = allRawItems.concat(pageItems);
          }
          nextUrl = nextData?.next_page_url || nextData?.links?.next || null;
        } catch (pageErr) {
          console.warn(`Error al consultar siguiente página (${nextUrl}):`, pageErr);
          break;
        }
      }

      const seenIds = new Set<string>();
      const uniqueRawList: any[] = [];
      for (const item of allRawItems) {
        const idVal = String(item.ID_AUTOR ?? item.id ?? item.id_autor ?? "");
        if (idVal && !seenIds.has(idVal)) {
          seenIds.add(idVal);
          uniqueRawList.push(item);
        } else if (!idVal) {
          uniqueRawList.push(item);
        }
      }

      const parsedList: Autor[] = uniqueRawList.map((item: any, index: number) => {
        const rawName = item.NOMBRE_AUTOR ?? item.nombre ?? 'Sin nombre';
        const id = item.ID_AUTOR ?? item.id ?? index + 1;
        return {
          id,
          ID_AUTOR: id,
          NOMBRE_AUTOR: String(rawName).trim(),
          FECHAINGRESO_AUTOR: item.FECHAINGRESO_AUTOR ?? item.created_at ?? null,
        };
      });
      setListaAutor(parsedList);
      setAutorSeleccionado((prev) => {
        if (!prev) return null;
        const prevId = String(prev.ID_AUTOR ?? prev.id);
        const matched = parsedList.find(
          (c) => String(c.ID_AUTOR ?? c.id) === prevId
        );
        return matched || null;
      });
    } catch (error: any) {
      console.error("Error al cargar autores:", error);
      Toast.fire({
        icon: "error",
        title: "No se pudieron cargar los Autores",
      });
    } finally {
      setLoadingAutor(false);
    }
  }, []);

  useEffect(() => {
    fetchAutor();
  }, [fetchAutor]);

  const handleOpen = useCallback(
    (autor?: Autor) => {
      if (autor) {
        setAutorEnEdicion(autor);
        setNombreAutor(String(autor.NOMBRE_AUTOR || ""));
      } else {
        setAutorEnEdicion(null);
        setNombreAutor("");
      }
      if (setVisibleProp) {
        setVisibleProp(true);
      } else {
        setInternalVisible(true);
      }
    },
    [setVisibleProp]
  );

  const handleClose = useCallback(() => {
    if (setVisibleProp) {
      setVisibleProp(false);
    } else {
      setInternalVisible(false);
    }
    setAutorEnEdicion(null);
    setNombreAutor("");
  }, [setVisibleProp]);

  const autoresFiltrados = useMemo(() => {
    const sorted = [...listaAutor].sort((a, b) => {
      const numA = Number(a.ID_AUTOR ?? a.id);
      const numB = Number(b.ID_AUTOR ?? b.id);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return String(a.NOMBRE_AUTOR).localeCompare(String(b.NOMBRE_AUTOR), undefined, {
        numeric: true,
      });
    });

    if (!busquedaAutor.trim()) return sorted;
    const q = busquedaAutor.toLowerCase().trim();
    return sorted.filter((aut) => {
      const nombre = (aut.NOMBRE_AUTOR || "").toLowerCase();
      const id = String(aut.ID_AUTOR ?? aut.id ?? "").toLowerCase();
      return nombre.includes(q) || id.includes(q);
    });
  }, [busquedaAutor, listaAutor]);

  const handleGuardarAutor = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();

      if (!nombreAutor.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Campos requeridos",
          text: "Por favor ingrese el nombre del autor",
          confirmButtonColor: "#0d6efd",
        });
        return;
      }

      setGuardando(true);
      try {
        const payload = {
          NOMBRE_AUTOR: nombreAutor.trim(),
          nombre: nombreAutor.trim(),
        };

        if (autorEnEdicion) {
          const id = autorEnEdicion.ID_AUTOR ?? autorEnEdicion.id;
          await ActualizarAutorLib(id, payload);

          Toast.fire({
            icon: "success",
            title: "Autor actualizado correctamente",
          });

          await fetchAutor();
          if (onAutorActualizado) {
            onAutorActualizado({
              ...autorEnEdicion,
              ...payload,
              NOMBRE_AUTOR: nombreAutor.trim(),
            });
          }
          if (
            autorSeleccionado &&
            String(autorSeleccionado.ID_AUTOR ?? autorSeleccionado.id) === String(id)
          ) {
            setAutorSeleccionado((prev) =>
              prev ? { ...prev, NOMBRE_AUTOR: nombreAutor.trim() } : null
            );
          }
        } else {
          const res = await NuevoAutorLib(payload);

          Toast.fire({
            icon: "success",
            title: "Autor registrado con éxito",
          });

          await fetchAutor();
          if (onAutorCreado) {
            onAutorCreado(
              res?.data ||
              res || {
                id: Date.now(),
                ID_AUTOR: Date.now(),
                ...payload,
              }
            );
          }
        }

        handleClose();
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al procesar la solicitud";

        Toast.fire({
          icon: "error",
          title: "Error al guardar el autor",
          text: errorMsg,
          confirmButtonColor: "#0d6efd",
        });
      } finally {
        setGuardando(false);
      }
    },
    [
      nombreAutor,
      autorEnEdicion,
      autorSeleccionado,
      fetchAutor,
      handleClose,
      onAutorActualizado,
      onAutorCreado,
    ]
  );

  const handleEliminarAutor = useCallback(
    async (autor?: Autor) => {
      const aut = autor ?? autorSeleccionado;
      if (!aut) return;

      const id = aut.ID_AUTOR ?? aut.id;
      if (!id) return;

      const confirmResult = await Swal.fire({
        title: "¿Estás seguro?",
        text: `Se eliminará el autor '${aut.NOMBRE_AUTOR}'`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar",
      });

      if (confirmResult.isConfirmed) {
        try {
          await EliminarAutorLib(id);
          Toast.fire({
            icon: "success",
            title: "Autor eliminado correctamente",
          });
          if (
            autorSeleccionado &&
            String(autorSeleccionado.ID_AUTOR ?? autorSeleccionado.id) === String(id)
          ) {
            setAutorSeleccionado(null);
          }
          await fetchAutor();
          if (onAutorEliminado) {
            onAutorEliminado(id);
          }
        } catch (error: any) {
          const msg =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            "No se pudo eliminar el autor";

          Swal.fire({
            icon: "error",
            title: "Error al eliminar el autor",
            text: msg,
            confirmButtonColor: "#0d6efd",
          });
        }
      }
    },
    [autorSeleccionado, fetchAutor, onAutorEliminado]
  );

  return {
    isVisible,
    handleClose,
    handleOpen,
    handleGuardarAutor,
    handleEliminarAutor,
    fetchAutor,
    onAutorActualizado,
    onAutorCreado,
    onAutorEliminado,
    listaAutor,
    setListaAutor,
    loadingAutor,
    setLoadingAutor,
    busquedaAutor,
    setBusquedaAutor,
    autorSeleccionado,
    setAutorSeleccionado,
    autorEnEdicion,
    setAutorEnEdicion,
    setGuardando,
    autoresFiltrados,
    guardando,
    nombreAutor,
    setNombreAutor,
  };
};

export default useAutor;
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";

const formSchema = z.object({
  NICK_USUARIO: z.string().min(1, { message: "Por favor ingrese su usuario." }),
  PASSWORD_USUARIO: z.string().min(1, { message: "Por favor ingrese su contraseña." }),
});

type FormValues = z.infer<typeof formSchema>;

export interface AuthFormSplitScreenProps {
  logo: React.ReactNode;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  onSubmit: (data: FormValues) => Promise<void>;
  forgotPasswordHref?: string;
  createAccountHref?: string;
}

function TopBrandBar() {
  return (
    <div className="absolute top-0 left-0 right-0 h-1.5 sm:h-2 flex w-full z-20">
      <div className="flex-1 bg-[#007DC5]" />
      <div className="flex-1 bg-[#E52320]" />
      <div className="flex-1 bg-[#FFCE00]" />
      <div className="flex-1 bg-[#009A44]" />
    </div>
  );
}

function WaveRibbonsBackground() {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      preserveAspectRatio="none"
      viewBox="0 0 1440 900"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cintas onduladas inferiores izquierdas que cruzan suavemente */}
      <path
        d="M-40,680 C180,620 220,840 500,810 C700,780 820,910 1050,880"
        stroke="#007DC5"
        strokeWidth="42"
        strokeOpacity="0.22"
        strokeLinecap="round"
      />
      <path
        d="M-60,740 C160,700 280,890 560,830 C760,780 900,900 1140,860"
        stroke="#E52320"
        strokeWidth="32"
        strokeOpacity="0.18"
        strokeLinecap="round"
      />
      <path
        d="M-30,790 C140,740 260,940 540,860 C740,800 960,880 1200,840"
        stroke="#FFCE00"
        strokeWidth="38"
        strokeOpacity="0.25"
        strokeLinecap="round"
      />
      <path
        d="M-50,830 C200,780 340,880 620,840 C840,810 1080,870 1320,810"
        stroke="#009A44"
        strokeWidth="36"
        strokeOpacity="0.22"
        strokeLinecap="round"
      />

      {/* Cintas onduladas suaves que suben por el borde derecho */}
      <path
        d="M1280,920 C1380,810 1370,660 1410,540 C1440,440 1420,320 1460,200"
        stroke="#007DC5"
        strokeWidth="30"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
      <path
        d="M1320,920 C1400,790 1390,630 1430,500 C1460,410 1440,290 1480,180"
        stroke="#E52320"
        strokeWidth="26"
        strokeOpacity="0.16"
        strokeLinecap="round"
      />
      <path
        d="M1350,920 C1420,770 1410,600 1450,470 C1480,390 1460,260 1500,160"
        stroke="#009A44"
        strokeWidth="32"
        strokeOpacity="0.2"
        strokeLinecap="round"
      />
    </motion.svg>
  );
}

export function AuthFormSplitScreen({
  logo,
  title,
  imageSrc,
  imageAlt,
  onSubmit,
}: AuthFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      NICK_USUARIO: "",
      PASSWORD_USUARIO: "",
    },
  });

  const handleFormSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 lg:p-14 overflow-hidden bg-white">
      {/* Barra superior con los 4 colores de marca Recreo */}
      <TopBrandBar />

      {/* Cintas onduladas suaves decorativas de fondo */}
      <WaveRibbonsBackground />

      <div className="relative z-10 w-full max-w-6xl xl:max-w-7xl flex flex-col md:flex-row items-center justify-center md:justify-around lg:justify-between gap-10 md:gap-14 lg:gap-20 xl:gap-24 px-4 sm:px-8 py-6">
        
        {/* Columna Izquierda: Formulario con animación de entrada */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="w-full md:w-1/2 max-w-[420px] sm:max-w-[460px] lg:max-w-[480px] mx-auto md:mx-0 flex flex-col justify-center"
        >
          {/* Logo BiblioRecreo */}
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="flex justify-center mb-2"
          >
            {logo}
          </motion.div>

          {/* Título */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight text-slate-900 text-center mb-8"
          >
            {title}
          </motion.h1>

          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          >
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-4 sm:space-y-5"
              >
                <FormField
                  control={form.control}
                  name="NICK_USUARIO"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Nombre de Usuario
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Usuario"
                          className="h-12 px-4 text-sm sm:text-base rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 shadow-none focus-visible:ring-1 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 transition-colors"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="PASSWORD_USUARIO"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-slate-700">
                        Contraseña
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••••••"
                            className="h-12 pl-4 pr-12 text-sm sm:text-base rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 shadow-none focus-visible:ring-1 focus-visible:ring-emerald-600 focus-visible:border-emerald-600 transition-colors"
                            {...field}
                            disabled={isLoading}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-0 hover:bg-slate-100 rounded-lg focus:outline-none transition-colors cursor-pointer flex items-center justify-center"
                            style={{ background: "transparent", border: "none", outline: "none", boxShadow: "none" }}
                            tabIndex={-1}
                            aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                            ) : (
                              <Eye className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-2">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold rounded-xl bg-[#00875a] hover:bg-[#00704a] text-white shadow-none transition-all duration-200 border-0"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </Form>
          </motion.div>
        </motion.div>

        {/* Columna Derecha: Tarjeta del Bus */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="w-full md:w-1/2 flex items-center justify-center"
        >
          <div
            className="relative w-full max-w-[480px] sm:max-w-[540px] lg:max-w-[600px] aspect-[4/4.6] rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-lg border border-slate-100"
          >
            <img
              src={imageSrc}
              alt={imageAlt}
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.includes("/bus-1.jpg")) {
                  target.src = "/bus-1.jpg";
                }
              }}
            />
          </div>
        </motion.div>

      </div>
    </div>
  );
}

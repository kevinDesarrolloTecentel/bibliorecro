"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
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
import { Loader2 } from "lucide-react";
import { CButton } from "@coreui/react-pro";
import CIcon from "@coreui/icons-react";
import { cilLockLocked, cilLockUnlocked } from "@coreui/icons";

const formSchema = z.object({
  email: z.string().min(1, { message: "Por favor ingrese su usuario o correo." }),
  password: z
    .string()
    .min(4, { message: "La contraseña debe tener al menos 4 caracteres." }),
  rememberMe: z.boolean().default(false).optional(),
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

/**
 * Interactive Particle Canvas + Mouse Spotlight Background
 */
function InteractiveBackground() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = React.useState({ x: -1000, y: -1000 });

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const particleColors = [
      "rgba(2, 37, 115, ",   // Blue
      "rgba(79, 70, 229, ",   // Indigo
      "rgba(14, 165, 233, ",  // Sky
      "rgba(255, 170, 0, ",  // Amber
      "rgba(255, 72, 43, ",   // Red/Coral
    ];

    const count = Math.min(Math.floor((width * height) / 16000), 70);
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2.5 + 1.5,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
      baseAlpha: Math.random() * 0.45 + 0.35,
    }));

    const mouse = { x: -1000, y: -1000, radius: 170 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw and update particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Interaction with mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          p.x -= (dx / dist) * force * 2.5;
          p.y -= (dy / dist) * force * 2.5;
        }

        // Draw circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.baseAlpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `${p.color}0.6)`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connecting lines between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist2 = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (dist2 < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist2 / 130) * 0.28;
            ctx.strokeStyle = `rgba(79, 70, 229, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect particle to mouse
        if (dist < mouse.radius) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          const alpha = (1 - dist / mouse.radius) * 0.45;
          ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
          ctx.lineWidth = 1.3;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-0"
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.18), rgba(99, 102, 241, 0.06) 45%, transparent 75%)`,
        }}
      />
    </>
  );
}

/**
 * A responsive, split-screen authentication form component with rich animated background.
 */
export function AuthFormSplitScreen({
  logo,
  title,
  description,
  imageSrc,
  imageAlt,
  onSubmit,
}: AuthFormSplitScreenProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-hidden bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/80">
      <InteractiveBackground />
      <motion.div
        className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-tr from-sky-400/30 to-blue-300/30 blur-3xl pointer-events-none"
        animate={{
          x: [0, 70, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-24 -right-20 h-[30rem] w-[30rem] rounded-full bg-gradient-to-bl from-indigo-400/30 to-purple-300/25 blur-3xl pointer-events-none"
        animate={{
          x: [0, -60, 0],
          y: [0, -70, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:28px_28px] opacity-20 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl lg:max-w-5xl rounded-3xl overflow-hidden shadow-[0_25px_60px_-15px_rgba(30,58,138,0.25)] border border-white/90 bg-white/90 backdrop-blur-2xl flex flex-col md:flex-row min-h-[580px]"
      >
        <div className="flex w-full flex-col justify-center p-6 sm:p-8 lg:p-10 md:w-1/2 bg-white/75 backdrop-blur-md">
          <div className="w-full flex items-center justify-center mb-2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              {logo}
            </motion.div>
          </div>
          <div className="w-full py-2">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-5"
            >
              <motion.div variants={itemVariants} className="text-center space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-slate-500">{description}</p>
                )}
              </motion.div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleFormSubmit)}
                  className="space-y-4"
                >
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Nombre de Usuario
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ingrese su usuario"
                              className="h-11 px-4 text-sm rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-semibold text-slate-700">
                            Contraseña
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••••••"
                                className="h-11 pl-4 pr-11 text-sm rounded-xl border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500/40 focus:border-blue-500 transition-all duration-200"
                                {...field}
                                disabled={isLoading}
                              />
                              <CButton
                                type="button"
                                variant="ghost"
                                color="secondary"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 border-0 shadow-none d-flex align-items-center justify-content-center"
                                tabIndex={-1}
                              >
                                <CIcon icon={showPassword ? cilLockUnlocked : cilLockLocked} />
                              </CButton>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants} className="pt-2">
                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-semibold rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-emerald-600 hover:from-teal-800 hover:via-teal-800 hover:to-teal-800 text-white shadow-lg shadow-teal-800/30 transition-all duration-200 hover:shadow-blue-500/50 hover:scale-[1.01] active:scale-[0.99]"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Iniciando sesión...
                        </>
                      ) : (
                        "Iniciar Sesión"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </Form>
            </motion.div>
          </div>
        </div>
        <div className="relative hidden md:block md:w-1/2 overflow-hidden bg-slate-100">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="h-full w-full object-cover object-center transition-transform duration-700 hover:scale-105"
          />
        </div>
      </motion.div>
    </div>
  );
}



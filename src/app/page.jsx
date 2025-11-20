"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import DeviceHistoryChart from "@/components/ChartCalorie"; // continua usando o componente adaptado

export default function Home() {
  return (
    <ScrollArea className="h-screen w-full p-6  from-background to-muted/20">
      <motion.div
        className="flex flex-col gap-6 max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
       
        <div className="text-center mb-4">
          <h1 className="text-3xl font-semibold tracking-tight">
            📊 Monitor de Telemetria – FIWARE
          </h1>
          <p className="text-muted-foreground mt-1">
            Dados em tempo real enviados pelo ESP32 via MQTT → IoT Agent → Orion → STH-Comet
          </p>
        </div>

        <Separator className="my-2" />

        
        <div className="grid gap-6 md:grid-cols-2">

         
          <Card className="shadow-lg border border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                🫀 Pressão Sistólica (SYS)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <DeviceHistoryChart attr="sys" />
            </CardContent>
          </Card>

          
          <Card className="shadow-lg border border-border/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                💓 Pressão Diastólica (DIA)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <DeviceHistoryChart attr="dia" />
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

       
        <footer className="text-center text-sm text-muted-foreground pb-4">
          Desenvolvido para FIWARE Demo — ESP32 → Orion → STH-Comet
        </footer>
      </motion.div>
    </ScrollArea>
  );
}

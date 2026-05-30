import { AlertTriangle, HardHat, ShieldAlert, Trash2, Lightbulb, Droplets, Leaf, Activity } from 'lucide-react';

export function getCategoryIcon(name, size = 14) {
  const normalized = name.toLowerCase();
  
  if (normalized.includes('infraestructura') || normalized.includes('bache')) return <HardHat size={size} />;
  if (normalized.includes('seguridad')) return <ShieldAlert size={size} />;
  if (normalized.includes('limpieza') || normalized.includes('basura')) return <Trash2 size={size} />;
  if (normalized.includes('alumbrado') || normalized.includes('luz')) return <Lightbulb size={size} />;
  if (normalized.includes('agua') || normalized.includes('alcantarillado')) return <Droplets size={size} />;
  if (normalized.includes('parque') || normalized.includes('áreas verdes')) return <Leaf size={size} />;
  if (normalized.includes('salud') || normalized.includes('ruido')) return <Activity size={size} />;
  
  return <AlertTriangle size={size} />;
}

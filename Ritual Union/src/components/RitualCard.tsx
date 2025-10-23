import { Play, Clock, Music } from "lucide-react";

interface RitualCardProps {
  name: string;
  type: string;
  duration: number;
  soundscapeName?: string;
  onStart: () => void;
}

export function RitualCard({
  name,
  type,
  duration,
  soundscapeName,
  onStart,
}: RitualCardProps) {
  const typeColors = {
    focus: "from-ritual-aurora-blue to-ritual-aurora-purple",
    break: "from-ritual-sage to-ritual-sage-light",
    reflection: "from-ritual-gold to-ritual-gold-light",
    custom: "from-ritual-indigo to-ritual-indigo-light",
  };

  const gradientClass = typeColors[type as keyof typeof typeColors] || typeColors.custom;

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-ritual-charcoal-light p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} opacity-10 transition-opacity duration-300 group-hover:opacity-20`}></div>
      
      <div className="relative">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="font-rounded text-xl font-semibold text-white">
              {name}
            </h3>
            <p className="mt-1 text-sm capitalize text-ritual-sage">
              {type} ritual
            </p>
          </div>
          <button
            onClick={onStart}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-ritual-gold text-ritual-charcoal transition-all duration-300 hover:scale-110 hover:bg-ritual-gold-light"
          >
            <Play className="h-5 w-5" fill="currentColor" />
          </button>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{duration} min</span>
          </div>
          {soundscapeName && (
            <div className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span>{soundscapeName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

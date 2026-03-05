import { Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCart } from "@/context/CartContext";
import type { Product } from "@shared/schema";

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const isUnavailable = product.status === "unavailable";

  return (
    <div className="group relative bg-card rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-border/60 flex flex-col h-full hover:-translate-y-1">
      <div className="relative aspect-square w-full rounded-2xl bg-muted/30 overflow-hidden mb-4 border border-border/40">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isUnavailable ? "grayscale opacity-60" : "group-hover:scale-110"
            }`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <span className="text-6xl opacity-20 filter drop-shadow-sm">🐟</span>
          </div>
        )}
        
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.status === "available" && (
            <Badge variant="outline" className="bg-emerald-50/90 backdrop-blur text-emerald-700 border-emerald-200 shadow-sm py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
              Available
            </Badge>
          )}
          {product.status === "limited" && (
            <Badge variant="outline" className="bg-amber-50/90 backdrop-blur text-amber-700 border-amber-200 shadow-sm py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mr-2"></span>
              Limited Stock
            </Badge>
          )}
          {product.status === "unavailable" && (
            <Badge variant="outline" className="bg-red-50/90 backdrop-blur text-red-700 border-red-200 shadow-sm py-1 opacity-90">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-2"></span>
              Sold Out
            </Badge>
          )}
        </div>

        {product.status === "limited" && product.limitedStockNote && (
          <div className="absolute bottom-3 left-3 right-3">
             <div className="bg-background/95 backdrop-blur rounded-lg px-3 py-1.5 text-xs font-medium text-amber-600 shadow-sm flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{product.limitedStockNote}</span>
             </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="text-sm font-medium text-primary mb-1 uppercase tracking-wider">{product.category}</div>
        <h3 className="font-display font-semibold text-lg text-foreground leading-tight mb-2">
          {product.name}
        </h3>
        
        <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/50">
          <div>
            <span className="text-2xl font-bold text-foreground">₹{product.price}</span>
            <span className="text-sm font-medium text-muted-foreground ml-1">/ {product.unit || "item"}</span>
          </div>
          <Button
            onClick={() => addToCart(product)}
            disabled={isUnavailable}
            className={`rounded-full shadow-lg ${
              isUnavailable 
                ? "" 
                : "bg-primary hover:bg-primary/90 shadow-primary/20 hover:shadow-primary/30"
            }`}
            size="sm"
          >
            {isUnavailable ? "Out" : <><Plus className="w-4 h-4 mr-1" /> Add</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

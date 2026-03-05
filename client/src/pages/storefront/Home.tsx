import { useState } from "react";
import { format } from "date-fns";
import { Header } from "@/components/storefront/Header";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { useProducts } from "@/hooks/use-products";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORIES = ["All", "Fish", "Prawns", "Chicken", "Mutton", "Masalas"];

export default function Home() {
  const { data: products, isLoading } = useProducts();
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredProducts = products?.filter((p) => {
    if (p.isArchived) return false;
    if (activeCategory === "All") return true;
    return p.category === activeCategory;
  }) || [];

  const todayStr = format(new Date(), "EEEE, MMMM do");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 sm:p-12 mb-8 shadow-2xl shadow-primary/20">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              Fresh on {todayStr}
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
              Fresh Catch,<br/>Delivered.
            </h1>
            <p className="text-primary-foreground/90 text-lg sm:text-xl max-w-md font-medium">
              Premium quality seafood and meats delivered straight to your door.
            </p>
          </div>
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-blue-400/40 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-20 -mb-20 w-64 h-64 bg-gradient-to-tr from-accent/30 to-transparent rounded-full blur-3xl"></div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto pb-4 mb-4 gap-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-semibold transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-foreground text-background shadow-lg scale-105"
                  : "bg-white text-muted-foreground border border-border/60 hover:border-foreground/30 hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-3xl p-4 border flex flex-col">
                <Skeleton className="w-full aspect-square rounded-2xl mb-4" />
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-8 w-full mb-4" />
                <div className="flex justify-between mt-auto">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-500">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="text-6xl mb-4 opacity-50 filter grayscale">🎣</div>
            <h3 className="text-2xl font-display font-semibold text-foreground mb-2">No items found</h3>
            <p className="text-muted-foreground">Check back later for fresh stock in this category.</p>
          </div>
        )}
      </main>

      <CartDrawer />
    </div>
  );
}

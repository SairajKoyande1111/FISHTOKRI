import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle2, Minus, Plus, ShoppingBag, Trash2,
  MapPin, ChevronRight, Banknote, CreditCard, Package
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCreateOrder } from "@/hooks/use-orders";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import fishImg from "@assets/Gemini_Generated_Image_w6wqkkw6wqkkw6wq_(1)_1772713077919.png";
import prawnsImg from "@assets/Gemini_Generated_Image_5xy0sd5xy0sd5xy0_1772713090650.png";
import chickenImg from "@assets/Gemini_Generated_Image_g0ecb4g0ecb4g0ec_1772713219972.png";
import muttonImg from "@assets/Gemini_Generated_Image_8fq0338fq0338fq0_1772713565349.png";
import masalaImg from "@assets/Gemini_Generated_Image_4e60a64e60a64e60_1772713888468.png";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "10-digit mobile number required").max(10),
  deliveryArea: z.string().min(1, "Delivery area is required"),
  address: z.string().min(5, "Full address is required"),
  notes: z.string().optional(),
});

type CheckoutData = z.infer<typeof checkoutSchema>;

const DELIVERY_AREAS = [
  "Thane", "Mulund", "Airoli", "Bhandup",
  "Vikhroli", "Powai", "Vashi", "Nerul"
];

interface SavedAddress {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  type: string;
}

export function CartDrawer() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, totalPrice, clearCart } = useCart();
  const { mutate: createOrder, isPending } = useCreateOrder();
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "online">("cod");
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [useNewAddress, setUseNewAddress] = useState(false);

  useEffect(() => {
    const addr = localStorage.getItem("fishtokri_addresses");
    if (addr) {
      const parsed: SavedAddress[] = JSON.parse(addr);
      setSavedAddresses(parsed);
      if (parsed.length > 0) setSelectedAddressId(parsed[0].id);
    }

    const profile = localStorage.getItem("fishtokri_profile");
    if (profile) {
      const p = JSON.parse(profile);
      if (p.name) form.setValue("customerName", p.name);
      if (p.phone) form.setValue("phone", p.phone);
    }
  }, [isCartOpen]);

  const getFallbackImage = (category: string) => {
    switch (category) {
      case "Prawns": return prawnsImg;
      case "Chicken": return chickenImg;
      case "Mutton": return muttonImg;
      case "Masalas": return masalaImg;
      default: return fishImg;
    }
  };

  const form = useForm<CheckoutData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerName: "", phone: "", deliveryArea: "", address: "", notes: "" },
  });

  const handleSelectedAddress = () => {
    const addr = savedAddresses.find(a => a.id === selectedAddressId);
    if (addr) {
      form.setValue("customerName", addr.name);
      form.setValue("phone", addr.phone);
      form.setValue("address", addr.address);
      form.setValue("deliveryArea", addr.area);
    }
  };

  const onSubmit = (data: CheckoutData) => {
    const orderItems = items.map(i => ({
      productId: i.id,
      quantity: i.quantity,
      name: i.name,
      price: i.price,
    }));
    createOrder({ ...data, items: orderItems }, {
      onSuccess: () => {
        setIsSuccess(true);
        clearCart();
        form.reset();
      },
    });
  };

  const handleClose = (open: boolean) => {
    if (!open && isSuccess) setTimeout(() => setIsSuccess(false), 300);
    setIsCartOpen(open);
  };

  const hasSavedAddresses = savedAddresses.length > 0;
  const showNewAddressForm = useNewAddress || !hasSavedAddresses;

  return (
    <Sheet open={isCartOpen} onOpenChange={handleClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background border-l border-border/50 p-0 overflow-hidden font-sans">
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h2>
            <p className="text-muted-foreground text-base mb-8 max-w-[260px]">
              Thank you! We'll contact you shortly to confirm your delivery.
            </p>
            <Button onClick={() => handleClose(false)} size="lg" className="w-full max-w-[220px] rounded-xl font-semibold bg-primary text-white">
              Back to Store
            </Button>
          </div>
        ) : (
          <>
            <SheetHeader className="px-5 py-4 border-b border-border/50 bg-white sticky top-0 z-10">
              <SheetTitle className="flex items-center gap-2 text-xl font-bold text-foreground">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Your Cart
                {items.length > 0 && (
                  <span className="ml-auto text-sm font-medium text-muted-foreground">{items.length} item{items.length > 1 ? "s" : ""}</span>
                )}
              </SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <ShoppingBag className="w-16 h-16 mb-4 opacity-10" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm mt-1 mb-6">Add some fresh items to get started</p>
                <Button variant="outline" onClick={() => setIsCartOpen(false)} className="rounded-xl">
                  Continue Browsing
                </Button>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  {/* Cart Items */}
                  <div className="px-5 py-4 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <Package className="w-4 h-4" /> Order Items
                    </h3>
                    {items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-white rounded-2xl border border-border/50 p-3 shadow-sm" data-testid={`cart-item-${item.id}`}>
                        <div className="w-16 h-16 rounded-xl bg-slate-50 overflow-hidden flex-shrink-0 border border-slate-100 p-1 flex items-center justify-center">
                          <img
                            src={item.imageUrl || getFallbackImage(item.category)}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.unit}</p>
                          <p className="text-sm font-bold text-primary mt-1">₹{item.price}</p>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 rounded-full px-2 py-1 border border-slate-100">
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white p-0"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.id}`}>
                            {item.quantity === 1 ? <Trash2 className="w-3 h-3 text-red-500" /> : <Minus className="w-3 h-3" />}
                          </Button>
                          <span className="text-sm font-bold w-5 text-center text-foreground">{item.quantity}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white p-0"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address */}
                  <div className="px-5 py-4 border-t border-border/30 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Delivery Address
                    </h3>

                    {hasSavedAddresses && !showNewAddressForm && (
                      <div className="space-y-2">
                        {savedAddresses.map(addr => (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => { setSelectedAddressId(addr.id); handleSelectedAddress(); }}
                            className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                              selectedAddressId === addr.id
                                ? "border-primary bg-primary/5"
                                : "border-border/50 bg-white hover:border-primary/30"
                            }`}
                            data-testid={`address-option-${addr.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                selectedAddressId === addr.id ? "border-primary" : "border-slate-300"
                              }`}>
                                {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-semibold text-sm text-foreground">{addr.name}</span>
                                  <span className="text-[10px] font-semibold uppercase bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{addr.type}</span>
                                </div>
                                <p className="text-xs text-muted-foreground">{addr.phone}</p>
                                <p className="text-xs text-muted-foreground">{addr.address}, {addr.area}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => setUseNewAddress(true)}
                          className="w-full flex items-center gap-2 text-sm text-primary font-medium py-2 px-1"
                        >
                          <Plus className="w-4 h-4" /> Add a different address
                        </button>
                      </div>
                    )}

                    {showNewAddressForm && (
                      <form id="checkout-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        {hasSavedAddresses && (
                          <button type="button" onClick={() => setUseNewAddress(false)} className="flex items-center gap-1.5 text-sm text-primary font-medium mb-1">
                            <ChevronRight className="w-4 h-4 rotate-180" /> Use saved address
                          </button>
                        )}
                        <div className="space-y-1.5">
                          <Label htmlFor="customerName" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
                          <Input id="customerName" placeholder="Your name" className="h-11 rounded-xl bg-white border-border/70" {...form.register("customerName")} data-testid="input-checkout-name" />
                          {form.formState.errors.customerName && <p className="text-xs text-red-500">{form.formState.errors.customerName.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</Label>
                          <Input id="phone" type="tel" placeholder="10-digit mobile" className="h-11 rounded-xl bg-white border-border/70" {...form.register("phone")} data-testid="input-checkout-phone" />
                          {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery Area</Label>
                          <Select onValueChange={val => form.setValue("deliveryArea", val)}>
                            <SelectTrigger className="h-11 rounded-xl bg-white border-border/70">
                              <SelectValue placeholder="Select area" />
                            </SelectTrigger>
                            <SelectContent>
                              {DELIVERY_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {form.formState.errors.deliveryArea && <p className="text-xs text-red-500">{form.formState.errors.deliveryArea.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</Label>
                          <Textarea id="address" placeholder="House/Flat, Street, Area" className="min-h-[72px] resize-none rounded-xl bg-white border-border/70 p-3" {...form.register("address")} data-testid="input-checkout-address" />
                          {form.formState.errors.address && <p className="text-xs text-red-500">{form.formState.errors.address.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Special Instructions <span className="font-normal text-muted-foreground/70">(optional)</span></Label>
                          <Textarea id="notes" placeholder="e.g. Cut into small pieces" className="min-h-[60px] resize-none rounded-xl bg-white border-border/70 p-3" {...form.register("notes")} />
                        </div>
                      </form>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div className="px-5 py-4 border-t border-border/30 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Payment Method</h3>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("cod")}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border/50 bg-white hover:border-primary/30"
                        }`}
                        data-testid="payment-cod"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "cod" ? "border-primary" : "border-slate-300"}`}>
                          {paymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <Banknote className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Cash on Delivery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all ${
                          paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border/50 bg-white hover:border-primary/30"
                        }`}
                        data-testid="payment-online"
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${paymentMethod === "online" ? "border-primary" : "border-slate-300"}`}>
                          {paymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <CreditCard className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">PhonePe / UPI / Cards / Net Banking</span>
                      </button>
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="px-5 py-4 border-t border-border/30 space-y-3 pb-6">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Order Summary</h3>
                    <div className="bg-white rounded-2xl border border-border/50 p-4 space-y-3">
                      {items.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span className="font-medium text-foreground">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                      <div className="border-t border-dashed border-border/50 pt-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">₹{totalPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-semibold text-emerald-600">FREE</span>
                        </div>
                      </div>
                      <div className="border-t border-border/50 pt-3 flex justify-between items-center">
                        <span className="font-bold text-foreground">Total</span>
                        <span className="text-xl font-bold text-primary">₹{totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sticky Footer */}
                <div className="px-5 py-4 border-t border-border/50 bg-white sticky bottom-0 z-10">
                  {hasSavedAddresses && !showNewAddressForm ? (
                    <Button
                      onClick={() => {
                        handleSelectedAddress();
                        const addr = savedAddresses.find(a => a.id === selectedAddressId);
                        if (addr) {
                          const orderItems = items.map(i => ({ productId: i.id, quantity: i.quantity, name: i.name, price: i.price }));
                          createOrder(
                            { customerName: addr.name, phone: addr.phone, deliveryArea: addr.area, address: addr.address, notes: "", items: orderItems },
                            { onSuccess: () => { setIsSuccess(true); clearCart(); } }
                          );
                        }
                      }}
                      disabled={isPending}
                      className="w-full h-13 py-3.5 text-base rounded-xl font-bold bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20"
                      data-testid="button-place-order"
                    >
                      {isPending ? "Placing Order..." : `Place Order · ₹${totalPrice}`}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      form="checkout-form"
                      disabled={isPending}
                      className="w-full h-13 py-3.5 text-base rounded-xl font-bold bg-primary text-white hover:bg-primary/95 shadow-lg shadow-primary/20"
                      data-testid="button-place-order"
                    >
                      {isPending ? "Placing Order..." : `Place Order · ₹${totalPrice}`}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

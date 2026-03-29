import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/storefront/Header";
import { CartDrawer, type SavedAddress } from "@/components/storefront/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  User, Phone, Mail, Calendar, MapPin, Plus, Pencil, Trash2,
  CheckCircle2, ChevronLeft, Home, Briefcase, Tag, Navigation, X
} from "lucide-react";

interface ProfileData {
  name: string;
  phone: string;
  email: string;
  dob: string;
}

const TYPE_OPTIONS = [
  { value: "house" as const, icon: <Home className="w-3.5 h-3.5" />, label: "House" },
  { value: "office" as const, icon: <Briefcase className="w-3.5 h-3.5" />, label: "Office" },
  { value: "other" as const, icon: <Tag className="w-3.5 h-3.5" />, label: "Other" },
];

const addressTypeColors: Record<string, string> = {
  house: "bg-pink-100 text-pink-700",
  office: "bg-purple-100 text-purple-700",
  other: "bg-amber-100 text-amber-700",
};

const emptyAddress: Omit<SavedAddress, "id"> = {
  name: "", phone: "", building: "", street: "", area: "",
  pincode: "", type: "house", label: "Home", instructions: "",
};

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>({ name: "", phone: "", email: "", dob: "" });
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);

  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<SavedAddress, "id">>(emptyAddress);
  const [useAccountDetails, setUseAccountDetails] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("fishtokri_profile");
    if (saved) { const p = JSON.parse(saved); setProfile(p); setDraftProfile(p); }
    const savedAddr = localStorage.getItem("fishtokri_addresses");
    if (savedAddr) setAddresses(JSON.parse(savedAddr));
  }, []);

  const saveProfile = () => {
    setProfile(draftProfile);
    localStorage.setItem("fishtokri_profile", JSON.stringify(draftProfile));
    setEditingProfile(false);
    toast({ title: "Profile updated" });
  };

  const openAddForm = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setUseAccountDetails(false);
    setShowAddressForm(true);
  };

  const openEditForm = (addr: SavedAddress) => {
    setEditingAddress(addr);
    setAddressForm({
      name: addr.name, phone: addr.phone, building: addr.building,
      street: addr.street, area: addr.area, pincode: addr.pincode || "",
      type: addr.type, label: addr.label, instructions: addr.instructions,
    });
    setUseAccountDetails(false);
    setShowAddressForm(true);
  };

  const cancelForm = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setUseAccountDetails(false);
  };

  const handleUseAccountDetails = (v: boolean) => {
    setUseAccountDetails(v);
    if (v) setAddressForm(f => ({ ...f, name: profile.name, phone: profile.phone }));
  };

  const saveAddress = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.building || !addressForm.area) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    const label = addressForm.type === "other"
      ? (addressForm.label || "Other")
      : addressForm.type === "house" ? "Home" : "Office";
    const entry: SavedAddress = {
      ...addressForm, label,
      id: editingAddress ? editingAddress.id : Date.now().toString(),
    };
    const updated = editingAddress
      ? addresses.map(a => a.id === editingAddress.id ? entry : a)
      : [...addresses, entry];
    setAddresses(updated);
    localStorage.setItem("fishtokri_addresses", JSON.stringify(updated));
    setShowAddressForm(false);
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    toast({ title: editingAddress ? "Address updated" : "Address added" });
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("fishtokri_addresses", JSON.stringify(updated));
    toast({ title: "Address removed" });
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full border border-border/50">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ─── Profile Details Card ─── */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-foreground" />
                <h2 className="text-base font-bold text-foreground">Profile Details</h2>
              </div>
              {!editingProfile && (
                <Button variant="ghost" size="icon" onClick={() => { setDraftProfile(profile); setEditingProfile(true); }} className="rounded-full text-muted-foreground hover:text-primary" data-testid="button-edit-profile">
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-3">
                {([
                  { field: "name" as const, label: "Full Name", placeholder: "Your name" },
                  { field: "phone" as const, label: "Phone Number", placeholder: "+91 00000 00000" },
                  { field: "email" as const, label: "Email", placeholder: "you@example.com" },
                ] as const).map(({ field, label, placeholder }) => (
                  <div key={field} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{label}</Label>
                    <Input value={draftProfile[field]} onChange={e => setDraftProfile(p => ({ ...p, [field]: e.target.value }))} placeholder={placeholder} className="rounded-xl border-border/60" data-testid={`input-profile-${field}`} />
                  </div>
                ))}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Date of Birth</Label>
                  <Input type="date" value={draftProfile.dob} onChange={e => setDraftProfile(p => ({ ...p, dob: e.target.value }))} className="rounded-xl border-border/60" data-testid="input-profile-dob" />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingProfile(false)}>Cancel</Button>
                  <Button className="flex-1 rounded-xl bg-primary text-white" onClick={saveProfile} data-testid="button-save-profile">Save</Button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Phone</p>
                  <p className="font-bold text-foreground">{profile.phone || <span className="font-normal italic text-muted-foreground text-sm">Not set</span>}</p>
                  {profile.phone && <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5"><CheckCircle2 className="w-3 h-3" /> Verified</p>}
                </div>
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Name</p>
                  <p className="font-bold text-foreground">{profile.name || <span className="font-normal italic text-muted-foreground text-sm">Not set</span>}</p>
                </div>
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Email</p>
                  <p className="font-bold text-foreground">{profile.email || <span className="font-normal italic text-muted-foreground text-sm">Not set</span>}</p>
                </div>
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-0.5">Date of Birth</p>
                  <p className="font-bold text-foreground">
                    {profile.dob
                      ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
                      : <span className="font-normal italic text-muted-foreground text-sm">Not set</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Saved Addresses Card ─── */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-foreground" />
                <h2 className="text-base font-bold text-foreground">Saved Addresses</h2>
              </div>
              {!showAddressForm ? (
                <Button onClick={openAddForm} size="sm" className="rounded-full bg-primary text-white text-xs px-4 gap-1 h-8 hover:bg-primary/90" data-testid="button-add-address">
                  <Plus className="w-3.5 h-3.5" /> Add New Address
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={cancelForm} className="text-muted-foreground hover:text-foreground text-xs gap-1 h-8 rounded-full" data-testid="button-cancel-address">
                  Cancel
                </Button>
              )}
            </div>

            {/* Inline address form */}
            {showAddressForm && (
              <div className="mb-5 pb-5 border-b border-border/30 space-y-4">
                <p className="text-sm font-semibold text-foreground">{editingAddress ? "Edit Address" : "Add New Address"}</p>

                {/* Use account details */}
                {profile.name && (
                  <div className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 border border-border/40">
                    <Checkbox id="use-account-profile" checked={useAccountDetails} onCheckedChange={v => handleUseAccountDetails(!!v)} className="mt-0.5" />
                    <div>
                      <label htmlFor="use-account-profile" className="text-sm font-semibold text-foreground cursor-pointer">Use my account details</label>
                      <p className="text-xs text-muted-foreground mt-0.5">{profile.name}{profile.phone && `, ${profile.phone}`}</p>
                    </div>
                  </div>
                )}

                {!useAccountDetails && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name *</Label>
                      <Input value={addressForm.name} onChange={e => setAddressForm(f => ({ ...f, name: e.target.value }))} placeholder="Recipient name" className="rounded-xl border-border/60" data-testid="input-addr-name" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone *</Label>
                      <Input value={addressForm.phone} onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))} placeholder="10-digit mobile" className="rounded-xl border-border/60" data-testid="input-addr-phone" />
                    </div>
                  </div>
                )}

                {/* Map placeholder */}
                <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-foreground">Set your location on map</p>
                    <p className="text-xs text-muted-foreground">Tap to pin your exact delivery location</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-lg border-primary/30 text-primary text-xs shrink-0 h-7 px-3">
                    Open Map
                  </Button>
                </div>

                {/* Location type */}
                <div className="flex gap-2">
                  {TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" onClick={() => setAddressForm(f => ({ ...f, type: opt.value }))}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        addressForm.type === opt.value ? "bg-foreground text-white border-foreground" : "bg-white text-muted-foreground border-border/50 hover:border-foreground/30"
                      }`}>
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Building / Floor *</Label>
                  <Input value={addressForm.building} onChange={e => setAddressForm(f => ({ ...f, building: e.target.value }))} placeholder="e.g. Kairali Park, Wing A, Floor 3" className="rounded-xl border-border/60" data-testid="input-addr-building" />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Street</Label>
                  <Input value={addressForm.street} onChange={e => setAddressForm(f => ({ ...f, street: e.target.value }))} placeholder="e.g. 205, MG Road" className="rounded-xl border-border/60" data-testid="input-addr-street" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Area *</Label>
                    <Input value={addressForm.area} onChange={e => setAddressForm(f => ({ ...f, area: e.target.value }))} placeholder="e.g. Thane West" className="rounded-xl border-border/60" data-testid="input-addr-area" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pincode *</Label>
                    <Input value={addressForm.pincode} onChange={e => setAddressForm(f => ({ ...f, pincode: e.target.value }))} placeholder="400001" type="tel" maxLength={6} className="rounded-xl border-border/60" data-testid="input-addr-pincode" />
                  </div>
                </div>

                {addressForm.type === "other" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Save address as *</Label>
                    <Input value={addressForm.label} onChange={e => setAddressForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Room, Gym, Parents Home" className="rounded-xl border-border/60" />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery Instructions</Label>
                  <Textarea
                    value={addressForm.instructions}
                    onChange={e => setAddressForm(f => ({ ...f, instructions: e.target.value }))}
                    placeholder="Instructions to reach (e.g. Take the first left near red gate)"
                    className="rounded-xl border-border/60 resize-none min-h-[64px] text-sm"
                    maxLength={100}
                  />
                  <p className="text-right text-xs text-muted-foreground">{(addressForm.instructions || "").length}/100</p>
                </div>

                <Button onClick={saveAddress} className="rounded-xl bg-primary text-white px-6 h-9 text-sm font-semibold" data-testid="button-save-address">
                  {editingAddress ? "Update Address" : "Save Address"}
                </Button>
              </div>
            )}

            {/* Address list */}
            {addresses.length === 0 && !showAddressForm ? (
              <div className="flex flex-col items-center justify-center py-10 text-center text-muted-foreground">
                <MapPin className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No saved addresses yet</p>
                <Button variant="link" onClick={openAddForm} className="mt-1 text-primary text-sm">+ Add your first address</Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4" data-testid={`card-address-${addr.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground text-sm">{addr.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${addressTypeColors[addr.type] || "bg-slate-100 text-slate-600"}`}>
                            {addr.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{addr.phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {[addr.building, addr.street, addr.area, addr.pincode].filter(Boolean).join(", ")}
                        </p>
                        {addr.instructions && (
                          <p className="text-xs text-muted-foreground/70 italic mt-1">"{addr.instructions}"</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="outline" size="sm" className="h-7 px-3 rounded-lg border-slate-200 text-muted-foreground hover:text-primary hover:border-primary/30 text-xs" onClick={() => openEditForm(addr)} data-testid={`button-edit-address-${addr.id}`}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-red-500" onClick={() => deleteAddress(addr.id)} data-testid={`button-delete-address-${addr.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <CartDrawer />
    </div>
  );
}

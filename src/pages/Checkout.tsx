import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  const [details, setDetails] = useState({
    email: "",
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pin: "",
    phone: "",
  });

  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string>("");
  const [showCoupons, setShowCoupons] = useState(false);

  const cartItems = useQuery(
    api.cart.getCartItems,
    user?._id ? { userId: user._id } : "skip"
  );

  const userOrders = useQuery(
    api.orders.getUserOrders,
    user?._id ? { userId: user._id } : "skip"
  );

  const createOrder = useMutation(api.orders.createOrder);
  const setCartItemQuantity = useMutation(api.cart.setCartItemQuantity);

  // Get the most recent saved address
  const savedAddress = userOrders && userOrders.length > 0 
    ? userOrders[0].shippingAddress 
    : null;

  const loadSavedAddress = () => {
    if (savedAddress) {
      setDetails({
        email: details.email,
        firstName: savedAddress.firstName,
        lastName: savedAddress.lastName,
        address1: savedAddress.address1,
        address2: savedAddress.address2 || "",
        city: savedAddress.city,
        state: savedAddress.state,
        pin: savedAddress.pin,
        phone: savedAddress.phone,
      });
      toast.success("Saved address loaded");
    }
  };

  const cartItemCount = (cartItems ?? []).reduce(
    (sum, item) => sum + (item.quantity ?? 0),
    0
  );

  // Calculate totals
  const estimatedTotal = (cartItems ?? []).reduce(
    (sum, item) => sum + (item.product.price ?? 0) * (item.quantity ?? 1),
    0
  );

  const packagingCharges = (cartItems ?? []).reduce((sum, item) => {
    const packaging = (item as any).packaging;
    const quantity = item.quantity ?? 1;
    if (!packaging || packaging === "without") return sum;
    if (packaging === "indian") return sum + 70 * quantity;
    if (packaging === "imported") return sum + 250 * quantity;
    return sum;
  }, 0);

  const subtotalWithPackaging = estimatedTotal + packagingCharges;
  const finalDiscount =
    discountPercentage > 0
      ? Math.round(subtotalWithPackaging * (discountPercentage / 100))
      : appliedDiscount;
  const discountedTotal = Math.max(0, subtotalWithPackaging - finalDiscount);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems && cartItems.length === 0) {
      navigate("/");
    }
  }, [cartItems, navigate]);

  // Generate UPI QR code
  const generateQRCode = () => {
    const upiId = "9302559917@jio";
    const payeeName = "Tanmay Agrawal";
    const amount = discountedTotal.toFixed(2);
    const transactionNote = `LUXE Order - ${details.firstName} ${details.lastName}`;

    const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

    setQrCodeUrl(qrApiUrl);
  };

  const handleProceedToPayment = () => {
    const required = [
      details.firstName,
      details.lastName,
      details.address1,
      details.city,
      details.state,
      details.pin,
      details.phone,
    ].every((v) => String(v || "").trim().length > 0);

    if (!required) {
      toast.error("Please fill all required delivery details");
      return;
    }

    generateQRCode();
    setShowPayment(true);
  };

  const handlePaymentConfirmation = async () => {
    if (!cartItems || cartItems.length === 0 || !user?._id) {
      window.location.href = "https://wa.me/9871629699";
      return;
    }

    // Save order to database
    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity ?? 1,
        price: item.product.price,
        color: (item as any).color,
        packaging: (item as any).packaging,
      }));

      await createOrder({
        userId: user._id as any,
        items: orderItems as any,
        total: discountedTotal,
        shippingAddress: {
          firstName: details.firstName,
          lastName: details.lastName,
          address1: details.address1,
          address2: details.address2,
          city: details.city,
          state: details.state,
          pin: details.pin,
          phone: details.phone,
        },
        paymentMethod: "UPI",
        discountApplied: finalDiscount,
      });
    } catch (error) {
      console.error("Failed to save order:", error);
    }

    // Generate WhatsApp message
    const lines: Array<string> = [];
    lines.push("✅ PAYMENT COMPLETED");
    lines.push("");
    lines.push("Order Details:");
    lines.push("");

    let grandTotal = 0;
    let totalPackagingCharges = 0;

    for (const item of cartItems) {
      const name = item.product.name;
      const qty = item.quantity ?? 1;
      const priceNum = item.product.price ?? 0;
      grandTotal += priceNum * qty;
      const price = `₹${priceNum.toLocaleString()}`;

      lines.push(`- ${name} | Qty: ${qty} | Price: ${price}`);
      if ((item as any).color) {
        const c = String((item as any).color);
        const cap = c.charAt(0).toUpperCase() + c.slice(1);
        lines.push(`  Color: ${cap}`);
      }
      if ((item as any).packaging) {
        const p = String((item as any).packaging);
        const packText =
          p === "indian"
            ? "Indian Box (+₹70)"
            : p === "imported"
            ? "Imported Box (Premium) (+₹250)"
            : "Without Box";
        lines.push(`  Packaging: ${packText}`);

        if (p === "indian") totalPackagingCharges += 70 * qty;
        else if (p === "imported") totalPackagingCharges += 250 * qty;
      }
      const productLink = `${window.location.origin}/product/${item.product._id}`;
      lines.push(`  Link: ${productLink}`);
    }

    if (totalPackagingCharges > 0) {
      lines.push("");
      lines.push(`Packaging charges: ₹${totalPackagingCharges.toLocaleString()}`);
    }

    let finalTotal = grandTotal + totalPackagingCharges;
    if (finalDiscount > 0) {
      lines.push("");
      if (appliedCouponCode === "COMBO15") {
        lines.push(`Discount code applied: COMBO15 - 15% off (₹${finalDiscount.toLocaleString()} saved)`);
      } else if (appliedCouponCode === "WATCH15") {
        lines.push(`Discount code applied: WATCH15 - 15% off on watches (₹${finalDiscount.toLocaleString()} saved)`);
      }
      finalTotal = Math.max(0, finalTotal - finalDiscount);
    }

    if (appliedCouponCode === "FREESHIP" && subtotalWithPackaging >= 799) {
      lines.push("");
      lines.push(`Free delivery applied: FREESHIP code`);
    }

    lines.push("");
    lines.push("Delivery Address:");
    lines.push(`${details.firstName} ${details.lastName}`);
    lines.push(`Contact number: ${details.phone}`);
    lines.push(`${details.address1}`);
    if (String(details.address2 || "").trim().length > 0) {
      lines.push(`${details.address2}`);
    }
    lines.push(`${details.city}, ${details.state} - ${details.pin}`);

    lines.push("");
    lines.push(`💰 Amount Paid: ₹${finalTotal.toLocaleString()}`);

    const message = lines.join("\n");
    const url = `https://wa.me/9871629699?text=${encodeURIComponent(message)}`;
    window.location.href = url;
  };

  const applyPromoCode = () => {
    const code = promoCode.trim().toUpperCase();

    if (code === "COMBO15") {
      if (cartItemCount < 2) {
        toast.error("Add at least 2 products to use COMBO15");
        return;
      }
      setDiscountPercentage(15);
      const discount = Math.round(subtotalWithPackaging * 0.15);
      setAppliedDiscount(discount);
      setAppliedCouponCode("COMBO15");
      setShowCoupons(false);
      toast.success("Coupon applied successfully!");
    } else if (code === "WATCH15") {
      const hasWatches = cartItems?.some((item) => item.product.category === "watches");
      if (!hasWatches) {
        toast.error("Add a watch to use WATCH15");
        return;
      }
      setDiscountPercentage(15);
      const discount = Math.round(subtotalWithPackaging * 0.15);
      setAppliedDiscount(discount);
      setAppliedCouponCode("WATCH15");
      setShowCoupons(false);
      toast.success("Watch discount applied!");
    } else if (code === "FREESHIP") {
      if (subtotalWithPackaging < 799) {
        toast.error("Add items worth ₹799 or more to use FREESHIP");
        return;
      }
      setAppliedCouponCode("FREESHIP");
      setShowCoupons(false);
      toast.success("Free delivery unlocked!");
    } else {
      toast.error("Invalid coupon code");
    }
  };

  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  if (showPayment) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] text-[#111111]">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-8 shadow-sm"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Scan to Pay</h1>
              <p className="text-lg text-gray-600">
                Amount: ₹{discountedTotal.toLocaleString()}
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center mb-6">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <img
                    src={qrCodeUrl}
                    alt="UPI Payment QR Code"
                    className="w-80 h-80"
                  />
                </div>
              </div>
            )}

            <p className="text-sm text-gray-500 mt-4 text-center">
              Scan this QR code with any UPI app to pay ₹{discountedTotal.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 text-center">
              The amount is locked and cannot be changed
            </p>

            <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
              <div className="flex justify-between text-base">
                <span className="font-medium">Subtotal</span>
                <span className="font-medium">₹{estimatedTotal.toLocaleString()}</span>
              </div>

              {packagingCharges > 0 && (
                <div className="flex justify-between text-base">
                  <span className="font-medium">Packaging charges</span>
                  <span className="font-medium">₹{packagingCharges.toLocaleString()}</span>
                </div>
              )}

              {finalDiscount > 0 && (
                <div className="flex justify-between text-base text-green-700">
                  <span className="font-medium">Discount ({appliedCouponCode})</span>
                  <span className="font-medium">-₹{finalDiscount.toLocaleString()}</span>
                </div>
              )}

              {appliedCouponCode === "FREESHIP" && subtotalWithPackaging >= 799 && (
                <div className="flex justify-between text-base text-green-700">
                  <span className="font-medium">Free Delivery</span>
                  <span className="font-medium">₹0</span>
                </div>
              )}

              <div className="flex justify-between text-xl font-bold pt-3 border-t border-gray-200">
                <span>Total</span>
                <span>₹{discountedTotal.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <Button
                variant="outline"
                className="flex-1 h-12"
                onClick={() => setShowPayment(false)}
              >
                Back
              </Button>
              <Button
                className="flex-1 h-12 bg-[#25D366] text-white hover:bg-[#20bd5b]"
                onClick={handlePaymentConfirmation}
              >
                Payment Done - Send Confirmation
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => navigate("/")}
            className="text-4xl font-extrabold tracking-widest font-['Abril_Fatface',serif] text-white"
          >
            LUXE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left Column - Contact & Delivery Form */}
          <div className="space-y-8">
            {/* Contact Section */}
            <div className="bg-white/5 rounded-lg p-8 border border-white/10">
              <h2 className="text-2xl font-bold mb-6 text-white">Contact</h2>
              <div className="space-y-4">
                <div>
                  <Input
                    type="tel"
                    placeholder="Contact number"
                    inputMode="tel"
                    maxLength={10}
                    value={details.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setDetails((d) => ({ ...d, phone: value }));
                    }}
                    className="w-full bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Section */}
            <div className="bg-white/5 rounded-lg p-8 border border-white/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Delivery</h2>
                {savedAddress && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadSavedAddress}
                    className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-sm"
                  >
                    Use Saved Address
                  </Button>
                )}
              </div>
              <div className="space-y-5">
                <div>
                  <Select value="India" disabled>
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white h-12 text-base">
                      <SelectValue placeholder="Country/Region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="India">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First name"
                    value={details.firstName}
                    onChange={(e) => setDetails((d) => ({ ...d, firstName: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                  />
                  <Input
                    placeholder="Last name"
                    value={details.lastName}
                    onChange={(e) => setDetails((d) => ({ ...d, lastName: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                  />
                </div>

                <div className="relative">
                  <Input
                    placeholder="Address"
                    value={details.address1}
                    onChange={(e) => setDetails((d) => ({ ...d, address1: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base pr-10"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>

                <Input
                  placeholder="Apartment, suite, etc. (optional)"
                  value={details.address2}
                  onChange={(e) => setDetails((d) => ({ ...d, address2: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                />

                <div className="grid grid-cols-[1.5fr_1.5fr_1fr] gap-4">
                  <Input
                    placeholder="City"
                    value={details.city}
                    onChange={(e) => setDetails((d) => ({ ...d, city: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                  />
                  <Select
                    value={details.state}
                    onValueChange={(v) => setDetails((d) => ({ ...d, state: v }))}
                  >
                    <SelectTrigger className="w-full bg-white/10 border-white/20 text-white h-12 text-base">
                      <SelectValue placeholder="State" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Andhra Pradesh">Andhra Pradesh</SelectItem>
                      <SelectItem value="Arunachal Pradesh">Arunachal Pradesh</SelectItem>
                      <SelectItem value="Assam">Assam</SelectItem>
                      <SelectItem value="Bihar">Bihar</SelectItem>
                      <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                      <SelectItem value="Goa">Goa</SelectItem>
                      <SelectItem value="Gujarat">Gujarat</SelectItem>
                      <SelectItem value="Haryana">Haryana</SelectItem>
                      <SelectItem value="Himachal Pradesh">Himachal Pradesh</SelectItem>
                      <SelectItem value="Jharkhand">Jharkhand</SelectItem>
                      <SelectItem value="Karnataka">Karnataka</SelectItem>
                      <SelectItem value="Kerala">Kerala</SelectItem>
                      <SelectItem value="Madhya Pradesh">Madhya Pradesh</SelectItem>
                      <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                      <SelectItem value="Manipur">Manipur</SelectItem>
                      <SelectItem value="Meghalaya">Meghalaya</SelectItem>
                      <SelectItem value="Mizoram">Mizoram</SelectItem>
                      <SelectItem value="Nagaland">Nagaland</SelectItem>
                      <SelectItem value="Odisha">Odisha</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                      <SelectItem value="Sikkim">Sikkim</SelectItem>
                      <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                      <SelectItem value="Telangana">Telangana</SelectItem>
                      <SelectItem value="Tripura">Tripura</SelectItem>
                      <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                      <SelectItem value="Uttarakhand">Uttarakhand</SelectItem>
                      <SelectItem value="West Bengal">West Bengal</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="PIN code"
                    inputMode="numeric"
                    maxLength={6}
                    value={details.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      setDetails((d) => ({ ...d, pin: value }));
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 h-12 text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div>
            <div className="bg-white/5 rounded-lg p-8 border border-white/10 sticky top-8">
              <h2 className="text-2xl font-bold mb-6 text-white">Order Summary</h2>

              {/* Product List */}
              <div className="space-y-5 mb-8">
                {cartItems.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      {item.product.images?.[0] && (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      )}
                      <div className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white text-black text-sm flex items-center justify-center font-bold">
                        {item.quantity}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-base truncate text-white">{item.product.name}</p>
                      {(item as any).color && (
                        <p className="text-sm text-white/60">
                          {String((item as any).color).charAt(0).toUpperCase() +
                            String((item as any).color).slice(1)}
                        </p>
                      )}
                      {(item as any).packaging && (
                        <p className="text-sm text-white/60">
                          {(item as any).packaging === "indian"
                            ? "Indian Box"
                            : (item as any).packaging === "imported"
                            ? "Premium Box"
                            : "Without Box"}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-base text-white">
                        ₹{(item.product.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code */}
              <div className="mb-8">
                {appliedCouponCode ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-emerald-400">
                          {appliedCouponCode} Applied
                        </p>
                        <p className="text-sm text-white/70">
                          {appliedCouponCode === "COMBO15" && `15% off - ₹${finalDiscount.toLocaleString()} saved`}
                          {appliedCouponCode === "WATCH15" && `15% off on watches - ₹${finalDiscount.toLocaleString()} saved`}
                          {appliedCouponCode === "FREESHIP" && "Free delivery unlocked"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAppliedDiscount(0);
                          setDiscountPercentage(0);
                          setAppliedCouponCode("");
                          setPromoCode("");
                          toast.success("Coupon removed");
                        }}
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowCoupons(!showCoupons)}
                      variant="outline"
                      className="w-full mb-4 border-white/20 bg-white/10 text-white hover:bg-white/20 h-12 justify-between"
                    >
                      <span>Apply coupon</span>
                      <svg
                        className={`h-5 w-5 transition-transform ${showCoupons ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </Button>

                    {showCoupons && (
                      <div className="space-y-4 mb-4">
                        {/* Manual Code Entry */}
                        <div className="flex gap-3">
                          <Input
                            placeholder="Enter coupon code"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 h-10 text-sm"
                          />
                          <Button
                            onClick={applyPromoCode}
                            variant="outline"
                            className="border-white/20 bg-white/10 text-white hover:bg-white/20 h-10 px-4 text-sm"
                          >
                            Apply
                          </Button>
                        </div>

                        <div className="text-xs text-white/50 text-center">Other Offers</div>

                        {/* COMBO15 Card */}
                        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded">
                                  SAVE 15%
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-white mb-1">Get 15% OFF on 2+ items</p>
                              <p className="text-xs text-white/60">Code: COMBO15</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setPromoCode("COMBO15");
                                applyPromoCode();
                              }}
                              disabled={cartItemCount < 2}
                              className={`h-8 px-4 text-xs ${
                                cartItemCount >= 2
                                  ? 'bg-white text-black hover:bg-white/90'
                                  : 'bg-white/10 text-white/40 cursor-not-allowed'
                              }`}
                            >
                              {cartItemCount >= 2 ? 'APPLY' : 'Add 2+ items'}
                            </Button>
                          </div>
                        </div>

                        {/* WATCH15 Card */}
                        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded">
                                  SAVE 15%
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-white mb-1">Watch Special</p>
                              <p className="text-xs text-white/70 mb-1">15% off on watches</p>
                              <p className="text-xs text-white/60">Code: WATCH15</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setPromoCode("WATCH15");
                                applyPromoCode();
                              }}
                              disabled={!cartItems?.some((item) => item.product.category === "watches")}
                              className={`h-8 px-4 text-xs ${
                                cartItems?.some((item) => item.product.category === "watches")
                                  ? 'bg-white text-black hover:bg-white/90'
                                  : 'bg-white/10 text-white/40 cursor-not-allowed'
                              }`}
                            >
                              {cartItems?.some((item) => item.product.category === "watches") ? 'APPLY' : 'Add a watch'}
                            </Button>
                          </div>
                        </div>

                        {/* FREESHIP Card */}
                        <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-white mb-1">Free Delivery</p>
                              <p className="text-xs text-white/70 mb-1">On orders above ₹799</p>
                              <p className="text-xs text-white/60">Code: FREESHIP</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => {
                                setPromoCode("FREESHIP");
                                applyPromoCode();
                              }}
                              disabled={subtotalWithPackaging < 799}
                              className={`h-8 px-4 text-xs ${
                                subtotalWithPackaging >= 799
                                  ? 'bg-white text-black hover:bg-white/90'
                                  : 'bg-white/10 text-white/40 cursor-not-allowed'
                              }`}
                            >
                              {subtotalWithPackaging >= 799 ? 'APPLY' : `Add ₹${(799 - subtotalWithPackaging).toLocaleString()} more`}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Pricing Breakdown */}
              <div className="space-y-4 pb-6 border-b border-white/10">
                <div className="flex justify-between text-base text-white/80">
                  <span>Subtotal</span>
                  <span className="text-white">₹{estimatedTotal.toLocaleString()}</span>
                </div>

                {packagingCharges > 0 && (
                  <div className="flex justify-between text-base text-white/80">
                    <span>Packaging charges</span>
                    <span className="text-white">₹{packagingCharges.toLocaleString()}</span>
                  </div>
                )}

                {finalDiscount > 0 && (
                  <div className="flex justify-between text-base text-emerald-400">
                    <span>Discount ({appliedCouponCode})</span>
                    <span>-₹{finalDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-base text-white/80">
                  <span>Shipping</span>
                  <span className="text-white/60">
                    {details.address1 ? "Calculated at next step" : "Enter shipping address"}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between text-2xl font-bold pt-6 mb-8 text-white">
                <span>Total</span>
                <span>INR ₹{discountedTotal.toLocaleString()}</span>
              </div>

              {/* Proceed to Payment Button */}
              <Button
                onClick={handleProceedToPayment}
                className="w-full h-14 bg-white text-black hover:bg-white/90 text-lg font-semibold"
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
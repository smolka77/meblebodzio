"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getCartKey, findColor, NO_PRODUCT_COLOR_ID } from "@/lib/kolory";
import { defaultSize, findSize, priceWithOptions } from "@/lib/rozmiary";
import {
  defaultOptionSelection,
  optionSelectionKey,
  optionsSurcharge,
  resolveOptionSelection,
  selectedOptionLabels,
  selectionFromResolved,
  type OptionSelection,
} from "@/lib/opcjeProduktu";
import { dedupeOrdersById } from "@/lib/narzedziaZamowien";
import { calculateOrderTotal, resolvePaymentStatus } from "@/lib/kasa";
import { storage, type StoredCoupon } from "@/lib/schowek";
import type {
  CartItem,
  CartLine,
  OrderStatus,
  PaymentStatus,
  PlaceOrderResult,
  Product,
  ProductColor,
  ProductSize,
  SavedConfiguration,
  SocialLink,
  UserOrder,
  UserProfile,
  ShopSettings,
  ProductCategory,
  CustomShopCategory,
} from "@/lib/typy";
import { getProductColorImage } from "@/lib/zdjeciaProduktu";
import { getFabricName } from "@/lib/infoTkanin";
import { useLanguage } from "@/kontekst/KontekstJezyka";
import { DEFAULT_VISIBLE_PRODUCT_CATEGORIES, normalizeVisibleProductCategories } from "@/lib/widocznoscKategorii";
import { isPurchasable, remainingWarehouseQty, warehouseQty } from "@/lib/stanMagazynu";

interface ShopContextValue {
  cart: CartLine[];
  cartCount: number;
  cartTotal: number;
  discountAmount: number;
  appliedCoupon: StoredCoupon | null;
  deliveryFee: number;
  orderTotal: number;
  checkoutSettings: Pick<
    ShopSettings,
    | "shopName"
    | "phone"
    | "deliveryFee"
    | "freeShippingThreshold"
    | "deliveryLeadText"
    | "discountCodesEnabled"
    | "newsletterOfferEnabled"
    | "newsletterOfferCode"
    | "newsletterOfferPercent"
    | "bankAccountName"
    | "bankAccountNumber"
    | "bankName"
  > | null;
  instagramUrl: string;
  socialLinks: SocialLink[];
  visibleProductCategories: ProductCategory[];
  customCategories: CustomShopCategory[];
  reloadCustomCategories: () => void;
  user: UserProfile | null;
  orders: UserOrder[];
  savedConfigs: SavedConfiguration[];
  toast: string | null;
  addToCart: (
    product: Product,
    quantity?: number,
    color?: ProductColor,
    size?: ProductSize,
    options?: OptionSelection
  ) => void;
  removeFromCart: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  restorePendingCheckout: () => boolean;
  discardPendingCheckout: () => void;
  isRedirectingToPayU: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<boolean>;
  saveConfiguration: (product: Product, color?: ProductColor) => boolean;
  removeConfiguration: (id: string) => void;
  applyCouponCode: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  placeOrder: (shipping: {
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    deliveryMethod: string;
    paymentMethod?: string;
    invoiceNip?: string;
    customer?: string;
    email?: string;
    applePayToken?: unknown;
  }) => Promise<PlaceOrderResult | null>;
}

const ShopContext = createContext<ShopContextValue | null>(null);

function itemKey(item: {
  productId: string;
  colorId: string;
  sizeId?: string;
  options?: OptionSelection;
}): string {
  return getCartKey(item.productId, item.colorId, item.sizeId, optionSelectionKey(item.options));
}

export function ShopProvider({
  children,
  visibleProductCategories: initialVisibleCategories = DEFAULT_VISIBLE_PRODUCT_CATEGORIES,
  customCategories: initialCustomCategories = [],
}: {
  children: React.ReactNode;
  visibleProductCategories?: ProductCategory[];
  customCategories?: CustomShopCategory[];
}) {
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<
    {
      productId: string;
      quantity: number;
      colorId: string;
      colorName: string;
      sizeId?: string;
      sizeLabel?: string;
      options?: OptionSelection;
    }[]
  >([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [savedConfigs, setSavedConfigs] = useState<SavedConfiguration[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [checkoutSettings, setCheckoutSettings] = useState<
    ShopContextValue["checkoutSettings"]
  >(null);
  const [appliedCoupon, setAppliedCoupon] = useState<StoredCoupon | null>(null);
  const [payuLeaving, setPayuLeaving] = useState(false);
  const [instagramUrl, setInstagramUrl] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [visibleProductCategories, setVisibleProductCategories] = useState<
    ProductCategory[]
  >(initialVisibleCategories);
  const [customCategories, setCustomCategories] = useState<CustomShopCategory[]>(
    initialCustomCategories
  );
  const [authCsrf, setAuthCsrf] = useState("");
  const ordersRef = useRef<UserOrder[]>([]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  const loadOrdersFromServer = useCallback(async () => {
    const res = await fetch("/api/account/orders", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as UserOrder[];
    const next = dedupeOrdersById(data);
    setOrders(next);
    const pending = storage.getPendingCheckout();
    if (
      pending &&
      next.some(
        (order) =>
          order.id === pending.orderId &&
          resolvePaymentStatus(order) === "confirmed"
      )
    ) {
      storage.clearPendingCheckout();
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    const res = await fetch("/api/auth", { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as {
      authenticated: boolean;
      user: UserProfile | null;
      csrf?: string;
    };
    if (data.csrf) setAuthCsrf(data.csrf);
    if (data.authenticated && data.user) {
      setUser(data.user);
      await loadOrdersFromServer();
    } else {
      setUser(null);
      setOrders([]);
    }
  }, [loadOrdersFromServer]);

  useEffect(() => {
    storage.purgeLegacyAuthData();
    void refreshAuth();
  }, [refreshAuth]);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then(setProducts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setCheckoutSettings({
          shopName: data.shopName ?? "Wrohaus",
          phone: data.phone ?? "",
          deliveryFee: data.deliveryFee ?? 249,
          freeShippingThreshold: data.freeShippingThreshold ?? 0,
          deliveryLeadText:
            typeof data.deliveryLeadText === "string" ? data.deliveryLeadText : undefined,
          discountCodesEnabled: data.discountCodesEnabled !== false,
          newsletterOfferEnabled: data.newsletterOfferEnabled === true,
          newsletterOfferCode:
            typeof data.newsletterOfferCode === "string"
              ? data.newsletterOfferCode
              : undefined,
          newsletterOfferPercent:
            typeof data.newsletterOfferPercent === "number"
              ? data.newsletterOfferPercent
              : undefined,
          bankAccountName: data.bankAccountName ?? "",
          bankAccountNumber: data.bankAccountNumber ?? "",
          bankName: data.bankName ?? "",
        });
        setInstagramUrl(
          typeof data.instagramUrl === "string" ? data.instagramUrl.trim() : ""
        );
        setSocialLinks(Array.isArray(data.socialLinks) ? data.socialLinks : []);
        if (Array.isArray(data.visibleProductCategories)) {
          setVisibleProductCategories(
            normalizeVisibleProductCategories(data.visibleProductCategories)
          );
        }
      })
      .catch(() => {});
  }, []);

  const reloadCustomCategories = useCallback(() => {
    fetch("/api/custom-categories")
      .then((r) => r.json())
      .then((data: CustomShopCategory[]) => {
        if (Array.isArray(data)) setCustomCategories(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    reloadCustomCategories();
  }, [reloadCustomCategories]);

  useEffect(() => {
    function onOperationalReset() {
      setOrders([]);
      setAppliedCoupon(null);
    }
    window.addEventListener("sofelio:operational-reset", onOperationalReset);
    return () =>
      window.removeEventListener("sofelio:operational-reset", onOperationalReset);
  }, []);

  useEffect(() => {
    if (products.length === 0) return;
    const raw = storage.getCart();
    const migrated = raw.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      const defaultColor = product?.colors?.[0];
      const size = findSize(product?.sizes, item.sizeId);
      const options = product
        ? selectionFromResolved(resolveOptionSelection(product, item.options))
        : item.options;
      return {
        productId: item.productId,
        quantity: item.quantity,
        colorId: item.colorId ?? defaultColor?.id ?? NO_PRODUCT_COLOR_ID,
        colorName: item.colorName ?? defaultColor?.name ?? "",
        sizeId: item.sizeId ?? size?.id,
        sizeLabel: item.sizeLabel ?? size?.label,
        ...(options && Object.keys(options).length ? { options } : {}),
      };
    });
    setCartItems(migrated);
    if (migrated.some((item, i) => !raw[i]?.colorId)) {
      storage.setCart(migrated);
    }
    setAppliedCoupon(storage.getCoupon());
    setSavedConfigs(storage.getSavedConfigs());
  }, [products]);

  const syncOrderStatuses = useCallback(async () => {
    const current = ordersRef.current;
    const ids = current.map((order) => order.id);
    if (ids.length === 0) return;

    const res = await fetch("/api/orders/sync", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (!res.ok) return;

    const updates = (await res.json()) as {
      id: string;
      status: OrderStatus;
      paymentStatus: PaymentStatus;
    }[];
    if (!Array.isArray(updates) || updates.length === 0) return;

    const pending = storage.getPendingCheckout();
    if (
      pending &&
      updates.some(
        (update) =>
          update.id === pending.orderId && update.paymentStatus === "confirmed"
      )
    ) {
      storage.clearPendingCheckout();
    }

    const byId = new Map(updates.map((update) => [update.id, update]));
    setOrders((prev) => {
      let changed = false;
      const next = prev.map((order) => {
        const update = byId.get(order.id);
        if (!update) return order;
        if (
          order.status === update.status &&
          (order.paymentStatus ?? "awaiting") === update.paymentStatus
        ) {
          return order;
        }
        changed = true;
        return {
          ...order,
          status: update.status,
          paymentStatus: update.paymentStatus,
        };
      });
      if (!changed) return prev;
      return next;
    });
  }, []);

  useEffect(() => {
    if (orders.length === 0) return;

    const needsSync = orders.some(
      (order) =>
        (order.status !== "delivered" && order.status !== "cancelled") ||
        resolvePaymentStatus(order) === "awaiting" ||
        resolvePaymentStatus(order) === "failed"
    );

    void syncOrderStatuses();
    if (!needsSync) return;

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        void syncOrderStatuses();
      }
    }, 8000);

    function onFocus() {
      void syncOrderStatuses();
    }
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, [orders, syncOrderStatuses]);

  useEffect(() => {
    function onPageShow(event: PageTransitionEvent) {
      if (event.persisted) setPayuLeaving(false);
    }
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 2500);
  }, []);

  const persistCart = useCallback((items: typeof cartItems) => {
    setCartItems(items);
    storage.setCart(items);
  }, []);

  const cart = useMemo<CartLine[]>(() => {
    return cartItems
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (!product) return null;
        const selectedColor = findColor(product.colors, item.colorId);
        const selectedSize = findSize(product.sizes, item.sizeId);
        const selectedOptions = resolveOptionSelection(product, item.options);
        const extra = optionsSurcharge(selectedOptions);
        const unit = priceWithOptions(product.price, selectedSize, selectedColor) + extra;
        return {
          ...product,
          image: selectedColor
            ? getProductColorImage(selectedColor, product.image)
            : product.image,
          price: unit,
          originalPrice:
            product.originalPrice != null
              ? priceWithOptions(product.originalPrice, selectedSize, selectedColor) + extra
              : undefined,
          quantity: item.quantity,
          cartKey: getCartKey(
            product.id,
            item.colorId,
            selectedSize?.id,
            optionSelectionKey(item.options)
          ),
          selectedColor: selectedColor
            ? { ...selectedColor, name: item.colorName || selectedColor.name }
            : undefined,
          selectedSize,
          selectedOptions: selectedOptions.length ? selectedOptions : undefined,
        };
      })
      .filter(Boolean) as CartLine[];
  }, [cartItems, products]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  const cartTotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cart]
  );

  const discountAmount = appliedCoupon?.discountAmount ?? 0;

  const orderTotals = useMemo(() => {
    if (!checkoutSettings) {
      return {
        discountAmount: 0,
        deliveryFee: 0,
        orderTotal: cartTotal,
      };
    }
    const totals = calculateOrderTotal(
      cartTotal,
      discountAmount,
      checkoutSettings,
      "standard",
      cart.map((item) => ({
        deliveryCost: item.deliveryCost,
        quantity: item.quantity,
      }))
    );
    return {
      discountAmount: totals.discountAmount,
      deliveryFee: totals.deliveryFee,
      orderTotal: totals.total,
    };
  }, [cart, cartTotal, discountAmount, checkoutSettings]);

  const deliveryFee = orderTotals.deliveryFee;
  const orderTotal = orderTotals.orderTotal;

  useEffect(() => {
    if (!appliedCoupon || cartTotal <= 0) return;

    let cancelled = false;
    fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: appliedCoupon.code, subtotal: cartTotal }),
    })
      .then(async (res) => {
        if (cancelled) return;
        if (!res.ok) {
          setAppliedCoupon(null);
          storage.setCoupon(null);
          return;
        }
        const data = (await res.json()) as StoredCoupon;
        setAppliedCoupon(data);
        storage.setCoupon(data);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cartTotal, appliedCoupon?.code]);

  const addToCart = useCallback(
    (
      product: Product,
      quantity = 1,
      color?: ProductColor,
      size?: ProductSize,
      options?: OptionSelection
    ) => {
      if (!isPurchasable(product)) return;
      const selected = color;
      const chosenSize = size ?? defaultSize(product);
      const resolvedOptions = resolveOptionSelection(
        product,
        options ?? defaultOptionSelection(product)
      );
      const optionSelection = resolvedOptions.length
        ? selectionFromResolved(resolvedOptions)
        : undefined;
      const colorId = selected?.id ?? NO_PRODUCT_COLOR_ID;
      const key = getCartKey(
        product.id,
        colorId,
        chosenSize?.id,
        optionSelectionKey(optionSelection)
      );
      const remaining = remainingWarehouseQty(
        product,
        cartItems.filter((item) => itemKey(item) !== key)
      );
      const existing = cartItems.find((i) => itemKey(i) === key);
      const current = existing?.quantity ?? 0;
      const wanted = current + quantity;
      const nextQty = remaining == null ? wanted : Math.min(wanted, remaining);
      if (nextQty <= current) {
        if (warehouseQty(product) != null) showToast(t("cart.stockLimit"));
        return;
      }
      setCartItems((prev) => {
        const found = prev.find((i) => itemKey(i) === key);
        const next = found
          ? prev.map((i) =>
              itemKey(i) === key ? { ...i, quantity: nextQty } : i
            )
          : [
              ...prev,
              {
                productId: product.id,
                quantity: nextQty,
                colorId,
                colorName: selected?.name ?? "",
                sizeId: chosenSize?.id,
                sizeLabel: chosenSize?.label,
                ...(optionSelection ? { options: optionSelection } : {}),
              },
            ];
        storage.setCart(next);
        return next;
      });
      const extra = [
        selected?.name,
        chosenSize?.label,
        ...selectedOptionLabels(resolvedOptions),
      ]
        .filter(Boolean)
        .join(", ");
      showToast(
        t("cart.added", {
          name: extra ? `${product.name} (${extra})` : product.name,
        })
      );
    },
    [cartItems, showToast, t]
  );

  const removeFromCart = useCallback((cartKey: string) => {
    setCartItems((prev) => {
      const next = prev.filter((i) => itemKey(i) !== cartKey);
      storage.setCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback(
    (cartKey: string, quantity: number) => {
      if (quantity < 1) {
        removeFromCart(cartKey);
        return;
      }
      setCartItems((prev) => {
        const target = prev.find((i) => itemKey(i) === cartKey);
        if (!target) return prev;
        const product = products.find((p) => p.id === target.productId);
        const remaining = remainingWarehouseQty(
          product,
          prev.filter((item) => itemKey(item) !== cartKey)
        );
        const nextQty =
          remaining == null ? quantity : Math.min(quantity, remaining);
        if (nextQty < 1) {
          const cleared = prev.filter((i) => itemKey(i) !== cartKey);
          storage.setCart(cleared);
          return cleared;
        }
        const next = prev.map((i) =>
          itemKey(i) === cartKey ? { ...i, quantity: nextQty } : i
        );
        storage.setCart(next);
        return next;
      });
    },
    [products, removeFromCart]
  );

  const clearCart = useCallback(() => {
    persistCart([]);
  }, [persistCart]);

  const discardPendingCheckout = useCallback(() => {
    storage.clearPendingCheckout();
  }, []);

  const restorePendingCheckout = useCallback(() => {
    const pending = storage.getPendingCheckout();
    if (!pending?.items.length) return false;
    persistCart(pending.items as CartItem[]);
    if (pending.coupon) {
      setAppliedCoupon(pending.coupon);
      storage.setCoupon(pending.coupon);
    }
    storage.clearPendingCheckout();
    return true;
  }, [persistCart]);

  const login = useCallback(
    async (email: string, password: string) => {
      let csrf = authCsrf;
      if (!csrf) {
        const statusRes = await fetch("/api/auth", { credentials: "include" });
        if (statusRes.ok) {
          const statusData = (await statusRes.json()) as { csrf?: string };
          csrf = statusData.csrf ?? "";
          if (csrf) setAuthCsrf(csrf);
        }
      }
      const res = await fetch("/api/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", email, password, csrf }),
      });
      if (!res.ok) return false;
      const data = (await res.json()) as {
        user: UserProfile;
        csrf?: string;
      };
      if (data.csrf) setAuthCsrf(data.csrf);
      setUser(data.user);
      await loadOrdersFromServer();
      showToast(t("account.welcome", { name: data.user.name }));
      return true;
    },
    [authCsrf, loadOrdersFromServer, showToast, t]
  );

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      let csrf = authCsrf;
      if (!csrf) {
        const statusRes = await fetch("/api/auth", { credentials: "include" });
        if (statusRes.ok) {
          const statusData = (await statusRes.json()) as { csrf?: string };
          csrf = statusData.csrf ?? "";
          if (csrf) setAuthCsrf(csrf);
        }
      }
      const res = await fetch("/api/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "register", ...data, csrf }),
      });
      if (!res.ok) return false;
      const payload = (await res.json()) as {
        user: UserProfile;
        csrf?: string;
      };
      if (payload.csrf) setAuthCsrf(payload.csrf);
      setUser(payload.user);
      setOrders([]);
      showToast(t("account.createdOk"));
      return true;
    },
    [authCsrf, showToast, t]
  );

  const logout = useCallback(() => {
    void (async () => {
      await fetch("/api/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout", csrf: authCsrf }),
      });
      setUser(null);
      setOrders([]);
      const statusRes = await fetch("/api/auth", { credentials: "include" });
      if (statusRes.ok) {
        const statusData = (await statusRes.json()) as { csrf?: string };
        if (statusData.csrf) setAuthCsrf(statusData.csrf);
      }
      showToast(t("account.loggedOut"));
    })();
  }, [authCsrf, showToast, t]);

  const updateProfile = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!user) return false;
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, csrf: authCsrf }),
      });
      if (!res.ok) return false;
      const updated = (await res.json()) as UserProfile;
      setUser(updated);
      showToast(t("account.profileUpdated"));
      return true;
    },
    [user, authCsrf, showToast, t]
  );

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const res = await fetch("/api/auth", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "changePassword",
          currentPassword,
          newPassword,
          csrf: authCsrf,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(data.error ?? t("account.passwordFail"));
        return false;
      }
      const data = (await res.json()) as { csrf?: string };
      if (data.csrf) setAuthCsrf(data.csrf);
      showToast(t("account.passwordChangedOk"));
      return true;
    },
    [authCsrf, showToast, t]
  );

  const saveConfiguration = useCallback(
    (product: Product, color?: ProductColor) => {
      const colorId = color?.id ?? NO_PRODUCT_COLOR_ID;
      const exists = savedConfigs.some(
        (item) => item.productId === product.id && item.colorId === colorId
      );
      if (exists) {
        showToast(t("account.configExists"));
        return false;
      }

      const next: SavedConfiguration[] = [
        {
          id: crypto.randomUUID(),
          productId: product.id,
          productSlug: product.slug,
          productName: product.name,
          productImage: color
            ? getProductColorImage(color, product.image)
            : product.image,
          colorId,
          colorName: color?.name ?? "",
          colorHex: color?.hex ?? "",
          fabricName: color ? getFabricName(color) : undefined,
          fabricMedia: color?.fabricMedia?.trim() || undefined,
          savedAt: new Date().toISOString(),
        },
        ...savedConfigs,
      ].slice(0, 40);

      setSavedConfigs(next);
      storage.setSavedConfigs(next);
      showToast(t("account.configSaved"));
      return true;
    },
    [savedConfigs, showToast, t]
  );

  const removeConfiguration = useCallback((id: string) => {
    setSavedConfigs((current) => {
      const next = current.filter((item) => item.id !== id);
      storage.setSavedConfigs(next);
      return next;
    });
    showToast(t("account.configRemoved"));
  }, [showToast, t]);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    storage.setCoupon(null);
    showToast(t("cart.couponRemoved"));
  }, [showToast, t]);

  const applyCouponCode = useCallback(
    async (code: string) => {
      const trimmed = code.trim();
      if (!trimmed) {
        showToast(t("cart.enterCoupon"));
        return false;
      }
      if (cartTotal <= 0) {
        showToast(t("cart.emptyToast"));
        return false;
      }

      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed, subtotal: cartTotal }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? t("cart.couponInvalid"));
        return false;
      }

      const coupon = (await res.json()) as StoredCoupon;
      setAppliedCoupon(coupon);
      storage.setCoupon(coupon);
      showToast(t("cart.couponApplied", { code: coupon.code }));
      return true;
    },
    [cartTotal, showToast, t]
  );

  const placeOrder = useCallback(
    async (shipping: {
      phone: string;
      address: string;
      city: string;
      postalCode: string;
      deliveryMethod: string;
      paymentMethod?: string;
      invoiceNip?: string;
      applePayToken?: unknown;
      customer?: string;
      email?: string;
    }) => {
      if (cart.length === 0) return null;
      if (!user && (!shipping.customer?.trim() || !shipping.email?.trim())) {
        return null;
      }

      const discount = appliedCoupon
        ? Math.min(
            cartTotal,
            Math.round(cartTotal * (appliedCoupon.discountPercent / 100))
          )
        : 0;
      const totals = calculateOrderTotal(
        cartTotal,
        discount,
        checkoutSettings ?? { deliveryFee: 249, freeShippingThreshold: 0 },
        shipping.deliveryMethod,
        cart.map((item) => ({
          deliveryCost: item.deliveryCost,
          quantity: item.quantity,
        }))
      );

      const res = await fetch("/api/orders", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            colorName: item.selectedColor?.name,
            sizeId: item.selectedSize?.id,
            sizeName: item.selectedSize?.label,
            options: item.selectedOptions?.length
              ? selectionFromResolved(item.selectedOptions)
              : undefined,
          })),
          subtotal: cartTotal,
          couponCode: appliedCoupon?.code,
          deliveryFee: totals.deliveryFee,
          total: totals.total,
          phone: shipping.phone,
          address: shipping.address,
          city: shipping.city,
          postalCode: shipping.postalCode,
          deliveryMethod: shipping.deliveryMethod,
          paymentMethod: shipping.paymentMethod,
          invoiceNip: shipping.invoiceNip,
          ...(!user
            ? { customer: shipping.customer, email: shipping.email }
            : {}),
          ...(shipping.applePayToken
            ? { applePayToken: shipping.applePayToken }
            : {}),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error ?? t("cart.orderFail"));
        return null;
      }

      const data = (await res.json()) as UserOrder & {
        payuRedirectUri?: string;
        guestAccessToken?: string;
      };
      if (!data.payuRedirectUri) {
        showToast(t("cart.payuMissing"));
        return null;
      }

      const { payuRedirectUri, guestAccessToken, ...order } = data;
      setOrders((prev) => dedupeOrdersById([order, ...prev]));
      storage.setPendingCheckout({
        orderId: order.id,
        items: cartItems,
        coupon: appliedCoupon,
        savedAt: Date.now(),
        guestToken: guestAccessToken,
      });
      setPayuLeaving(true);
      setAppliedCoupon(null);
      storage.setCoupon(null);
      clearCart();
      return { order, payuRedirectUri };
    },
    [
      cart,
      cartItems,
      cartTotal,
      appliedCoupon,
      checkoutSettings,
      clearCart,
      showToast,
      t,
      user,
    ]
  );

  return (
    <ShopContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        discountAmount: orderTotals.discountAmount,
        appliedCoupon,
        deliveryFee,
        orderTotal,
        checkoutSettings,
        instagramUrl,
        socialLinks,
        visibleProductCategories,
        customCategories,
        reloadCustomCategories,
        user,
        orders,
        savedConfigs,
        toast,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        restorePendingCheckout,
        discardPendingCheckout,
        isRedirectingToPayU: payuLeaving,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        saveConfiguration,
        removeConfiguration,
        applyCouponCode,
        removeCoupon,
        placeOrder,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 bg-charcoal px-6 py-3 text-sm text-cream shadow-lg">
          {toast}
        </div>
      )}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}

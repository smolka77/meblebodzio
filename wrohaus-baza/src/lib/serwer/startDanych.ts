import { products as seedProducts } from "@/lib/dane";
import { productDetailsMap } from "@/lib/opisyProduktow";
import { readStore, writeStore, fileExists } from "./baza";
import {
  ADMIN_AUTH_VERSION,
  ADMIN_PASSWORD_HASH,
  ADMIN_USERNAME,
} from "./startAdmina";
import { DEFAULT_VISIBLE_PRODUCT_CATEGORIES } from "@/lib/widocznoscKategorii";
import type { Product, ShopSettings, NewsletterSubscriber, FaqCategory, BlogPost, Fabric } from "@/lib/typy";
import { DEFAULT_HOMEPAGE } from "@/lib/stronaGlowna";
import { DEFAULT_ABOUT } from "@/lib/oNas";
import { DEFAULT_DELIVERY } from "@/lib/dostawa";
import { DEFAULT_PRODUCT_TAGS } from "@/lib/tagi";
import type { DescriptionTemplatesStore } from "@/lib/szablonyOpisuZapis";
import { getDefaultFaqCategories } from "@/lib/faqDomyslne";
import { getDefaultBlogPosts } from "@/lib/blogDomyslny";
import { getDefaultFabrics } from "@/lib/tkaninyDomyslne";
import { company } from "@/lib/firma";
import { applyContentPatches } from "@/lib/serwer/poprawkiTresci";

export const DEFAULT_SETTINGS: ShopSettings = {
  shopName: company.brandName,
  contactEmail: company.email,
  phone: "",
  deliveryFee: 249,
  freeShippingThreshold: 0,
  deliveryLeadText: "do 5 dni roboczych",
  discountCodesEnabled: true,
  bankAccountName: company.legalName,
  bankAccountNumber: "",
  bankName: "",
  returnsDays: 14,
  notifyNewOrders: true,
  notifyLowStock: true,
  notifyWeeklyReport: false,
  instagramUrl: "",
  socialLinks: [],
  adminEmail: `admin@${company.domain}`,
  adminUsername: ADMIN_USERNAME,
  adminPassword: ADMIN_PASSWORD_HASH,
  adminAuthVersion: ADMIN_AUTH_VERSION,
  visibleProductCategories: [...DEFAULT_VISIBLE_PRODUCT_CATEGORIES],
};

export async function ensureStoreSeeded() {
  if (!(await fileExists("products.json"))) {
    const products: Product[] = seedProducts.map((p) => ({
      ...p,
      details: productDetailsMap[p.slug],
    }));
    await writeStore("products.json", products);
  }

  if (!(await fileExists("orders.json"))) {
    await writeStore("orders.json", []);
  }

  if (!(await fileExists("settings.json"))) {
    await writeStore("settings.json", DEFAULT_SETTINGS);
  }

  if (!(await fileExists("newsletter.json"))) {
    await writeStore<NewsletterSubscriber[]>("newsletter.json", []);
  }

  if (!(await fileExists("sessions.json"))) {
    await writeStore("sessions.json", []);
  }

  if (!(await fileExists("users.json"))) {
    await writeStore("users.json", []);
  }

  if (!(await fileExists("chats.json"))) {
    await writeStore("chats.json", []);
  }

  if (!(await fileExists("faq.json"))) {
    await writeStore<FaqCategory[]>("faq.json", getDefaultFaqCategories());
  }

  if (!(await fileExists("contact-messages.json"))) {
    await writeStore("contact-messages.json", []);
  }

  if (!(await fileExists("blog.json"))) {
    await writeStore<BlogPost[]>("blog.json", getDefaultBlogPosts());
  }

  if (!(await fileExists("fabrics.json"))) {
    await writeStore<Fabric[]>("fabrics.json", getDefaultFabrics());
  } else {
    const fabrics = await readStore<Fabric[]>("fabrics.json", []);
    if (fabrics.length === 0) {
      await writeStore<Fabric[]>("fabrics.json", getDefaultFabrics());
    }
  }

  if (!(await fileExists("fabric-sample-requests.json"))) {
    await writeStore("fabric-sample-requests.json", []);
  }

  if (!(await fileExists("coupons.json"))) {
    await writeStore("coupons.json", []);
  }

  if (!(await fileExists("promotions.json"))) {
    await writeStore("promotions.json", []);
  }

  const { ensureFurnitureLinesSeeded } = await import("./linieMeblowe");
  await ensureFurnitureLinesSeeded();

  if (!(await fileExists("homepage.json"))) {
    await writeStore("homepage.json", DEFAULT_HOMEPAGE);
  }

  if (!(await fileExists("about.json"))) {
    await writeStore("about.json", DEFAULT_ABOUT);
  }

  if (!(await fileExists("delivery.json"))) {
    await writeStore("delivery.json", DEFAULT_DELIVERY);
  }

  if (!(await fileExists("tags.json"))) {
    await writeStore("tags.json", DEFAULT_PRODUCT_TAGS);
  }

  if (!(await fileExists("description-templates.json"))) {
    await writeStore<DescriptionTemplatesStore>("description-templates.json", {
      custom: [],
    });
  }

  await applyContentPatches();
}

export async function initStore() {
  await ensureStoreSeeded();
  return readStore("settings.json", DEFAULT_SETTINGS);
}

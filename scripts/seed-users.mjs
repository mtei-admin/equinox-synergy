import { createClient } from "@supabase/supabase-js";
import {
  invalidServiceRoleKeyMessage,
  resolveServiceRoleKey,
  resolveSupabaseUrl,
} from "./supabase-env.mjs";

const SEED_USERS = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    email: "dealer@equinox.local",
    password: "Dealer123!",
    role: "dealer",
    company_name: "Acme Outdoors",
    contact_name: "Demo Dealer",
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    email: "admin@equinox.local",
    password: "Admin123!",
    role: "employee",
    company_name: "Equinox Synergy",
    contact_name: "Demo Admin",
  },
];

const SEED_PRODUCTS = [
  {
    sku: "EQX-1001",
    name: "Trail Cam Pro 4K",
    description:
      "Weatherproof trail camera with 4K video and 120-day battery life.",
    supplier_cost: 89,
    dealer_price: 149.99,
    stock_quantity: 45,
  },
  {
    sku: "EQX-1002",
    name: "Summit Binocular 10x42",
    description: "Lightweight roof-prism binoculars for field scouting.",
    supplier_cost: 62,
    dealer_price: 109.99,
    stock_quantity: 28,
  },
  {
    sku: "EQX-1003",
    name: "Ridge Backpack 45L",
    description:
      "Modular hunting pack with hydration sleeve and rifle carry.",
    supplier_cost: 74.5,
    dealer_price: 129.99,
    stock_quantity: 0,
  },
  {
    sku: "EQX-1004",
    name: "NightScope IR Illuminator",
    description:
      "Long-range IR illuminator compatible with Equinox optics.",
    supplier_cost: 41.25,
    dealer_price: 79.99,
    stock_quantity: 8,
  },
  {
    sku: "EQX-1005",
    name: "Base Camp Field Kit",
    description:
      "Starter kit with cleaning tools, straps, and maintenance oils.",
    supplier_cost: 18,
    dealer_price: 34.99,
    stock_quantity: 120,
  },
  {
    sku: "EQX-1006",
    name: "Pro Tripod Carbon",
    description: "Carbon fiber tripod rated for spotting scopes up to 12 lbs.",
    supplier_cost: 95,
    dealer_price: 169.99,
    stock_quantity: 15,
  },
];

const url = resolveSupabaseUrl();
const serviceRoleKey = resolveServiceRoleKey();

if (!url || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.",
  );
  console.error(
    "Add SUPABASE_SERVICE_ROLE_KEY from Dashboard → Settings → API → service_role.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function main() {
  console.log("Seeding Equinox Synergy sample users...\n");

  const { data: existingUsers, error: lookupError } =
    await supabase.auth.admin.listUsers();

  if (lookupError) {
    throw lookupError;
  }

  const usersByEmail = new Map(
    existingUsers.users
      .filter((entry) => entry.email)
      .map((entry) => [entry.email, entry]),
  );

  for (const user of SEED_USERS) {
    const found = usersByEmail.get(user.email);
    let userId = found?.id ?? user.id;

    if (found) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        found.id,
        {
          password: user.password,
          email_confirm: true,
        },
      );

      if (updateError) {
        throw updateError;
      }
    } else {
      const { data, error: createError } = await supabase.auth.admin.createUser(
        {
          id: user.id,
          email: user.email,
          password: user.password,
          email_confirm: true,
        },
      );

      if (createError) {
        throw createError;
      }

      userId = data.user.id;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId,
          role: user.role,
          company_name: user.company_name,
          contact_name: user.contact_name,
          contact_email: user.email,
          is_active: true,
        },
        { onConflict: "id" },
      );

    if (profileError) {
      throw profileError;
    }

    console.log(`  ✓ ${user.role.padEnd(8)} ${user.email}`);
  }

  for (const product of SEED_PRODUCTS) {
    const { error: productError } = await supabase.from("products").upsert(
      {
        sku: product.sku,
        name: product.name,
        description: product.description,
        supplier_cost: product.supplier_cost,
        dealer_price: product.dealer_price,
        stock_quantity: product.stock_quantity,
        is_active: true,
      },
      { onConflict: "sku" },
    );

    if (productError) {
      throw productError;
    }

    console.log(`  ✓ product   ${product.sku}`);
  }

  const SEED_ANNOUNCEMENTS = [
    {
      title: "Welcome to Equinox Synergy",
      body: "Your dealer portal is live. Browse inventory, submit purchase orders, and download published manuals from the Asset Library.",
      author_id: "11111111-1111-1111-1111-111111111102",
    },
    {
      title: "Spring product lineup available",
      body: "New trail optics and field kits are in stock. Review wholesale pricing in the Inventory catalog and place orders before month end.",
      author_id: "11111111-1111-1111-1111-111111111102",
    },
  ];

  for (const announcement of SEED_ANNOUNCEMENTS) {
    const { data: existing } = await supabase
      .from("announcements")
      .select("id")
      .eq("title", announcement.title)
      .maybeSingle();

    if (existing) {
      console.log(`  ✓ skip     ${announcement.title}`);
      continue;
    }

    const { error: announcementError } = await supabase
      .from("announcements")
      .insert({
        ...announcement,
        is_published: true,
        published_at: new Date().toISOString(),
        is_active: true,
      });

    if (announcementError) {
      throw announcementError;
    }

    console.log(`  ✓ news     ${announcement.title}`);
  }

  console.log("\nSample credentials (development only):");
  console.log("  Dealer: dealer@equinox.local / Dealer123!");
  console.log("  Admin:  admin@equinox.local  / Admin123!");
}

main().catch((error) => {
  const message = error.message ?? String(error);

  if (message.toLowerCase().includes("invalid api key")) {
    console.error("Seed failed:", invalidServiceRoleKeyMessage());
  } else {
    console.error("Seed failed:", message);
  }

  process.exit(1);
});

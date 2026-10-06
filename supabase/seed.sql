-- ==============================================================================
-- RSCREATION - SEED DATA SCRIPT (CORRECTED STRICT HEXADECIMAL UUIDs)
-- Populates initial categories, products, coupons, and site settings.
-- Run this in the Supabase SQL Editor after running 20260404000000_rscreation_schema.sql
-- ==============================================================================

-- 1. Insert Initial Categories (Valid UUIDs: c0000000-0000-0000-0000-000000000001 to 0009)
INSERT INTO public.categories (id, name, slug, description, image_url, icon_name, featured, sort_order)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'Telugu Flex Banner PSD', 'telugu-flex', 'High-resolution Telugu flex banner PSDs ready for offset & digital printing', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/telugu-flex-banner.jpg', 'LayoutTemplate', TRUE, 1),
  ('c0000000-0000-0000-0000-000000000002', 'Wedding & Engagement', 'wedding', 'Royal Indian wedding card designs, lagna patrika & engagement PSD templates', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/wedding-invitation.jpg', 'HeartHandshake', TRUE, 2),
  ('c0000000-0000-0000-0000-000000000003', 'Festival & Devotional', 'festival', 'Diwali, Sankranti, Dussehra, Vinayaka Chavithi, and temple celebration posters', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/festival-poster.jpg', 'Sparkles', TRUE, 3),
  ('c0000000-0000-0000-0000-000000000004', 'Shop Boards & Billboard', 'shop-boards', '3D acrylic letter storefront sign boards, flex hoarding & shop nameplates', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/shop-billboard.jpg', 'Store', TRUE, 4),
  ('c0000000-0000-0000-0000-000000000005', 'Birthday Banners', 'birthday', 'Kids 1st birthday, milestone celebrations & mass photo birthday flex banners', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/birthday-flex.jpg', 'Gift', FALSE, 5),
  ('c0000000-0000-0000-0000-000000000006', 'Political Banners', 'political', 'Leader felicitation, campaign banners, victory flex & election hoardings', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/political-flex.jpg', 'Flag', FALSE, 6),
  ('c0000000-0000-0000-0000-000000000007', 'Invitation Cards', 'invitation', 'House warming (Gruhapravesam), cradle ceremony & saree function invitations', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/invitation-card.jpg', 'Mail', FALSE, 7),
  ('c0000000-0000-0000-0000-000000000008', 'Photo Frames & Karizma', 'photo-frames', 'Karizma wedding album sheets, studio photo frames and montage PSDs', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/karizma-album.jpg', 'Image', FALSE, 8),
  ('c0000000-0000-0000-0000-000000000009', 'Business Banners & Social', 'business', 'Corporate social media templates, business promotion flyers and roll-up stands', 'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/business-flyer.jpg', 'Briefcase', FALSE, 9)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. Insert Initial Products (Valid UUIDs: d0000000-0000-0000-0000-000000000001 to 0006)
INSERT INTO public.products (
  id, title, slug, description, primary_category_id, price, original_price,
  file_format, file_size, dimensions, dpi, color_mode, files_included,
  software_compatibility, fonts_included, telugu_fonts_supported,
  preview_image_url, tags, features, status, is_trending, is_bestseller,
  is_latest, downloads_count, rating, reviews_count
) VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'Grand Royal Telugu Wedding Lagna Patrika & Invitation Card PSD',
    'royal-telugu-wedding-invitation-psd',
    'Ultra-luxurious royal Telugu wedding invitation and Lagna Patrika design. Features layered gold foil ornamentation, traditional mangalya sutram motifs, deep maroon textures, and fully customizable Telugu and English typography. Designed specifically for offset print presses and digital sharing on WhatsApp.',
    'c0000000-0000-0000-0000-000000000002',
    349.00,
    799.00,
    'PSD',
    '148 MB',
    '12 x 18 inches (3600 x 5400 px)',
    300,
    'CMYK',
    '1 Main PSD + 1 JPG Preview + Free Telugu Font Pack Links',
    'Adobe Photoshop CS6 or higher',
    TRUE,
    TRUE,
    'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/wedding-invitation.jpg',
    ARRAY['Telugu Wedding', 'Lagna Patrika', 'Pelli Card', 'PSD Template', 'Royal Gold', 'Wedding Flex'],
    ARRAY['100% Layered PSD file with organized folders', 'High Resolution 300 DPI CMYK Print Ready', 'Telugu Unicode Fonts and Anuvaad typography links included', 'Gold foil and embossed effects on separate non-destructive layers'],
    'published',
    TRUE,
    TRUE,
    FALSE,
    1420,
    4.9,
    128
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'Mass Celebration Telugu Flex Banner 10x8 Feet PSD Template',
    'mass-celebration-telugu-flex-banner-psd',
    'High-impact Telugu flex banner template suitable for village festivals, youth celebrations, sports tournaments, and leader welcomes. Built with bold Telugu typography gradients, lighting bursts, cutout placeholders, and custom 3D Telugu lettering styles.',
    'c0000000-0000-0000-0000-000000000001',
    299.00,
    650.00,
    'PSD',
    '310 MB',
    '120 x 96 inches (10 x 8 ft)',
    100,
    'CMYK',
    '1 Editable PSD + 1 Full Size Mockup JPG',
    'Photoshop CC 2019+',
    TRUE,
    TRUE,
    'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/telugu-flex-banner.jpg',
    ARRAY['Telugu Flex', 'Mass Banner', 'Youth Association', 'Flex Design', 'Village Jathara'],
    ARRAY['Huge 10ft x 8ft print ready canvas with 100 DPI at actual size', 'Easily swap photo cutouts with smart objects', 'Dynamic fireworks and light flare layers included'],
    'published',
    TRUE,
    TRUE,
    FALSE,
    2310,
    4.8,
    94
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Sri Vinayaka Chavithi & Dussehra Grand Festival Flex Poster PSD',
    'vinayaka-chavithi-dussehra-festival-flex-psd',
    'Sacred and devotional festival poster PSD template celebrating Vinayaka Chavithi, Vijayadashami Dussehra, and temple annual celebrations. Includes glowing oil lamps (diyas), intricate temple gopuram arch, floral garlands, and auspicious Telugu shlokas.',
    'c0000000-0000-0000-0000-000000000003',
    249.00,
    599.00,
    'PSD',
    '240 MB',
    '60 x 48 inches (5 x 4 ft)',
    150,
    'CMYK',
    '1 PSD + Telugu Typography Guide + Fonts Link',
    'Adobe Photoshop CS6, CC',
    TRUE,
    TRUE,
    'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/festival-poster.jpg',
    ARRAY['Festival Poster', 'Vinayaka Chavithi', 'Dussehra', 'Telugu Devotional', 'Pooja Flex'],
    ARRAY['Full CMYK print-ready color separation', 'Divine temple mandap backdrop with gold pillars', 'Separate layers for Lord Ganesha / Durga Devi placeholders'],
    'published',
    TRUE,
    FALSE,
    TRUE,
    1890,
    4.9,
    156
  ),
  (
    'd0000000-0000-0000-0000-000000000004',
    'Modern Retail Shop Name Board & 3D Acrylic Glow Billboard PSD',
    'modern-retail-shop-name-board-psd',
    'Professional commercial shop front sign board and LED glow signage PSD template. Ideal for jewelry showrooms, textile outlets, supermarkets, electronics shops, and mobile stores in Andhra Pradesh and Telangana.',
    'c0000000-0000-0000-0000-000000000004',
    399.00,
    899.00,
    'PSD',
    '275 MB',
    '180 x 36 inches (15 x 3 ft)',
    100,
    'CMYK',
    '1 PSD (Shop Front Board) + 1 PSD (Side Pillar Standee)',
    'Photoshop CC 2018+',
    TRUE,
    TRUE,
    'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/shop-billboard.jpg',
    ARRAY['Shop Board', 'Signboard PSD', 'Storefront Flex', 'Commercial Billboard', 'LED Board'],
    ARRAY['3D Acrylic embossed Telugu and English title layer styles', 'Includes LED back-light glow layer switches', 'Modular layout with contact bar, GST number & address footer'],
    'published',
    FALSE,
    TRUE,
    FALSE,
    980,
    4.7,
    68
  ),
  (
    'd0000000-0000-0000-0000-000000000005',
    'Royal Engagement Ceremony & Ring Exchange Invitation PSD Card',
    'royal-engagement-ceremony-invitation-psd',
    'Contemporary pastel and gold themed engagement (Nischitartham) invitation card PSD. Beautiful geometric frames with blush pink roses, golden couple rings placeholder, and bilingual Telugu/English layout.',
    'c0000000-0000-0000-0000-000000000002',
    299.00,
    599.00,
    'PSD',
    '115 MB',
    '5 x 7 inches (1500 x 2100 px)',
    300,
    'CMYK',
    '2 PSDs (Print Card + Digital WhatsApp Card)',
    'Photoshop CS6 to CC 2026',
    TRUE,
    TRUE,
    'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/wedding-invitation.jpg',
    ARRAY['Nischitartham', 'Engagement Card', 'Ring Ceremony', 'WhatsApp Invite'],
    ARRAY['Double sided card design', 'Instagram Story & WhatsApp format included (1080x1920)', 'Print ready 5x7 inches with bleed marks'],
    'published',
    FALSE,
    FALSE,
    TRUE,
    1140,
    4.8,
    82
  ),
  (
    'd0000000-0000-0000-0000-000000000006',
    'Political Victory & Birthday Felicitation Flex Banner 12x8 Ft PSD',
    'political-victory-birthday-felicitation-banner-psd',
    'Dynamic political greetings and birthday flex banner template. Designed with state leader portrait grids, tricolor banner sweeps, gold lion emblem highlights, and powerful Telugu felicitation quotes.',
    'c0000000-0000-0000-0000-000000000006',
    349.00,
    750.00,
    'PSD',
    '360 MB',
    '144 x 96 inches (12 x 8 ft)',
    100,
    'CMYK',
    '1 High-Res Flex PSD + Cutout Frames Guide',
    'Photoshop CC',
    TRUE,
    TRUE,
    'https://zticcsbyrejkctqwvzur.supabase.co/storage/v1/object/public/product-previews/telugu-flex-banner.jpg',
    ARRAY['Political Banner', 'Telugu Leader Flex', 'Birthday Flex', 'Party Hoarding'],
    ARRAY['Grid layout for 12+ leader photos and local cadre circles', 'Customizable flag gradient overlays', 'High print clarity on Star Flex & normal vinyl'],
    'published',
    TRUE,
    FALSE,
    TRUE,
    890,
    4.7,
    53
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price;

-- 3. Insert Initial Active Coupons (Valid UUIDs: a0000000-0000-0000-0000-000000000001 to 0004)
INSERT INTO public.coupons (id, code, discount_percent, max_discount_amount, min_order_amount, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'FIRST50', 20, 200.00, 200.00, TRUE),
  ('a0000000-0000-0000-0000-000000000002', 'RSCREATION50', 20, 250.00, 200.00, TRUE),
  ('a0000000-0000-0000-0000-000000000003', 'FESTIVAL', 15, 150.00, 150.00, TRUE),
  ('a0000000-0000-0000-0000-000000000004', 'TELUGU100', 15, 150.00, 150.00, TRUE)
ON CONFLICT (code) DO NOTHING;

-- 4. Insert Site Settings
INSERT INTO public.site_settings (key, value)
VALUES
  ('general', '{"site_name": "RScreation", "tagline": "Creative Designs. Unlimited Possibilities.", "support_email": "support@rscreation.in", "support_phone": "+91 98480 22334"}'::jsonb),
  ('store', '{"currency": "INR", "currency_symbol": "₹", "instant_download": true, "max_download_attempts": 15}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

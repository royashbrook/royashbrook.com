# import blocks for what already exists in the zone. resource bodies come from
# `tofu plan -generate-config-out=generated.tf`, then get tidied into dns.tf / rules.tf / settings.tf.
# NOT imported: the apex `AAAA 100::` record (345cc96f...) -- that's wrangler's worker custom domain.
# NOT present: zone-level HSTS (off; ours lives in the worker _headers). email routing (we're o365).

locals {
  z = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# --- o365 + www dns records ---
import {
  to = cloudflare_dns_record.autodiscover
  id = "${local.z}/572b6da55e9331feccd5825f8c284c2d"
}
import {
  to = cloudflare_dns_record.enterpriseenrollment
  id = "${local.z}/b7dbab58af33a64db5b6822dbf360654"
}
import {
  to = cloudflare_dns_record.enterpriseregistration
  id = "${local.z}/3f9ea9f507abf9e6404b86d651c2721b"
}
import {
  to = cloudflare_dns_record.lyncdiscover
  id = "${local.z}/0d9b646dd4bf3624e0be69f84da8f980"
}
import {
  to = cloudflare_dns_record.sip
  id = "${local.z}/0b64ae6071e5ef5fc127b01e63e37696"
}
import {
  to = cloudflare_dns_record.www
  id = "${local.z}/ded4267f2a16e2f830dace8575152091"
}
import {
  to = cloudflare_dns_record.mx
  id = "${local.z}/d7485232924e6fe6baf9683ecd40dba3"
}
import {
  to = cloudflare_dns_record.srv_sipfederationtls
  id = "${local.z}/359c0ddca14f1b92d2984687ba1c6a2d"
}
import {
  to = cloudflare_dns_record.srv_sip_tls
  id = "${local.z}/e0573e309978842050bfb54fb0567676"
}
import {
  to = cloudflare_dns_record.txt_spf
  id = "${local.z}/f18b037dda2c9f6bc1d55eb0119eca60"
}

# --- www -> apex redirect ruleset (dynamic_redirect phase) ---
import {
  to = cloudflare_ruleset.redirect
  id = "zones/${local.z}/cf8db416e5684e0bbc9806a6baad51af"
}

# --- zone settings ---
import {
  to = cloudflare_zone_setting.always_use_https
  id = "${local.z}/always_use_https"
}

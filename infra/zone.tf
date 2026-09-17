# __generated__ by OpenTofu
# Please review these resources and move them into your main configuration files.

# __generated__ by OpenTofu
resource "cloudflare_dns_record" "srv_sip_tls" {
  data = {
    port     = 443
    priority = 100
    target   = "sipdir.online.lync.com"
    weight   = 1
  }
  name     = "_sip._tls.royashbrook.com"
  priority = 100
  proxied  = false
  settings = {
    ipv4_only = null
    ipv6_only = null
  }
  tags    = []
  ttl     = 1
  type    = "SRV"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu
resource "cloudflare_dns_record" "srv_sipfederationtls" {
  data = {
    port     = 5061
    priority = 100
    target   = "sipfed.online.lync.com"
    weight   = 1
  }
  name     = "_sipfederationtls._tcp.royashbrook.com"
  priority = 100
  proxied  = false
  settings = {
    ipv4_only = null
    ipv6_only = null
  }
  tags    = []
  ttl     = 1
  type    = "SRV"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/ded4267f2a16e2f830dace8575152091"
resource "cloudflare_dns_record" "www" {
  content = "royashbrook.com"
  name    = "www.royashbrook.com"
  proxied = true
  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }
  tags    = []
  ttl     = 1
  type    = "CNAME"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/f18b037dda2c9f6bc1d55eb0119eca60"
resource "cloudflare_dns_record" "txt_spf" {
  content = "\"v=spf1 include:spf.protection.outlook.com -all\""
  name    = "royashbrook.com"
  proxied = false
  settings = {
    ipv4_only = null
    ipv6_only = null
  }
  tags    = []
  ttl     = 1
  type    = "TXT"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/always_use_https"
resource "cloudflare_zone_setting" "always_use_https" {
  setting_id = "always_use_https"
  value      = "on"
  zone_id    = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/b7dbab58af33a64db5b6822dbf360654"
resource "cloudflare_dns_record" "enterpriseenrollment" {
  content = "enterpriseenrollment.manage.microsoft.com"
  name    = "enterpriseenrollment.royashbrook.com"
  proxied = false
  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }
  tags    = []
  ttl     = 1
  type    = "CNAME"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/572b6da55e9331feccd5825f8c284c2d"
resource "cloudflare_dns_record" "autodiscover" {
  content = "autodiscover.outlook.com"
  name    = "autodiscover.royashbrook.com"
  proxied = false
  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }
  tags    = []
  ttl     = 1
  type    = "CNAME"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "zones/e45d9809405489b5bac3b5d3e4e1a9aa/cf8db416e5684e0bbc9806a6baad51af"
resource "cloudflare_ruleset" "redirect" {
  description = ""
  kind        = "zone"
  name        = "default"
  phase       = "http_request_dynamic_redirect"
  rules = [
    {
      action = "redirect"
      action_parameters = {
        from_value = {
          preserve_query_string = true
          status_code           = 301
          target_url = {
            expression = "wildcard_replace(http.request.full_uri, r\"https://www.*\", r\"https://$${1}\")"
          }
        }
      }
      description = "Redirect from WWW to root [Template]"
      enabled     = true
      expression  = "(http.request.full_uri wildcard r\"https://www.*\")"
      ref         = "fde09a3c43bb4bdd8fa3f6d20d5bc445"
    },
  ]
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/0b64ae6071e5ef5fc127b01e63e37696"
resource "cloudflare_dns_record" "sip" {
  content = "sipdir.online.lync.com"
  name    = "sip.royashbrook.com"
  proxied = false
  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }
  tags    = []
  ttl     = 1
  type    = "CNAME"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/d7485232924e6fe6baf9683ecd40dba3"
resource "cloudflare_dns_record" "mx" {
  content  = "royashbrook-com.mail.protection.outlook.com"
  name     = "royashbrook.com"
  priority = 0
  proxied  = false
  settings = {
    ipv4_only = null
    ipv6_only = null
  }
  tags    = []
  ttl     = 1
  type    = "MX"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/0d9b646dd4bf3624e0be69f84da8f980"
resource "cloudflare_dns_record" "lyncdiscover" {
  content = "webdir.online.lync.com"
  name    = "lyncdiscover.royashbrook.com"
  proxied = false
  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }
  tags    = []
  ttl     = 1
  type    = "CNAME"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# __generated__ by OpenTofu from "e45d9809405489b5bac3b5d3e4e1a9aa/3f9ea9f507abf9e6404b86d651c2721b"
resource "cloudflare_dns_record" "enterpriseregistration" {
  content = "enterpriseregistration.windows.net"
  name    = "enterpriseregistration.royashbrook.com"
  proxied = false
  settings = {
    flatten_cname = false
    ipv4_only     = false
    ipv6_only     = false
  }
  tags    = []
  ttl     = 1
  type    = "CNAME"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

# --- rate limit the per-tool MCP endpoints (royashbrook.com/<tool>) ---
# one client was polling GET /hush about 58 times a minute from a single IP, and every one of those
# is a worker invocation (the worker runs before any cache). the rate limit phase runs before the
# worker, so throttled requests never invoke it. GET only: real MCP use is POST and is untouched,
# and a person in a browser makes one GET that 302s to the repo. free plan shape: 10s period,
# 10s block, ip + colo.
resource "cloudflare_ruleset" "tool_ratelimit" {
  kind    = "zone"
  name    = "default"
  phase   = "http_ratelimit"
  zone_id = "e45d9809405489b5bac3b5d3e4e1a9aa"
  rules = [
    {
      action      = "block"
      description = "throttle GET polling of the per-tool MCP endpoints"
      enabled     = true
      expression  = "(http.request.method eq \"GET\" and http.request.uri.path in {\"/hush\" \"/doorbell\" \"/waterbear\" \"/trustmebro\" \"/sql-spider\" \"/roy-sql\"})"
      ratelimit = {
        characteristics     = ["ip.src", "cf.colo.id"]
        period              = 10
        requests_per_period = 2
        mitigation_timeout  = 10
      }
    },
  ]
}

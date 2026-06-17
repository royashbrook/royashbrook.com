# EMAIL — staged, COMMENTED OUT on purpose.
#
# royashbrook.com email is currently on Microsoft 365 (the MX / SPF TXT / autodiscover / lync /
# sip / SRV / enterprise records live in zone.tf as plain dns records). We are NOT using CF Email
# Routing yet.
#
# TO CUT OVER to a free CF Email Routing catch-all (*@royashbrook.com -> one inbox, RECEIVE-ONLY):
#   1. uncomment the two resources below, set `destination_address` to the real inbox.
#   2. in zone.tf, DELETE the o365 mail records that CF Email Routing replaces:
#        - cloudflare_dns_record.mx        (outlook MX)
#        - cloudflare_dns_record.txt_spf   (outlook SPF)  -> email routing sets its own MX + SPF
#      (the autodiscover/lync/sip/SRV/enterprise records can stay or go; they're o365-client stuff,
#       harmless once mail stops flowing to o365, but tidy them up too.)
#   3. `tofu apply` -- this swaps the MX to route1/2/3.mx.cloudflare.net and turns on the catch-all.
#   4. verify the destination inbox actually receives, THEN decommission the o365 org.
# token already has Email Routing Rules: Edit, so no re-issue needed.
#
# resource "cloudflare_email_routing_address" "forward_to" {
#   account_id = local.account_id
#   email      = "REPLACE_WITH_DESTINATION@example.com"  # gmail/yahoo/wherever; gets a verify email
# }
#
# resource "cloudflare_email_routing_catch_all" "all" {
#   zone_id = local.zone_id
#   name    = "catch-all"
#   enabled = true
#   matchers = [{ type = "all" }]
#   actions  = [{ type = "forward", value = ["REPLACE_WITH_DESTINATION@example.com"] }]
# }

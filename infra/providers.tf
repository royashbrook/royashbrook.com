terraform {
  required_version = ">= 1.9"
  required_providers {
    cloudflare = { source = "cloudflare/cloudflare", version = "~> 5.0" }
  }
  # state in R2 (S3-compatible). creds come from env (AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY),
  # injected from the keychain via the secrets skill, never committed.
  backend "s3" {
    bucket                      = "royashbrook-tfstate"
    key                         = "royashbrook.tfstate"
    region                      = "auto"
    endpoints                   = { s3 = "https://b13c1cf2483bdad430b91ae25126e984.r2.cloudflarestorage.com" }
    skip_credentials_validation = true
    skip_region_validation      = true
    skip_requesting_account_id  = true
    skip_metadata_api_check     = true
    skip_s3_checksum            = true
    use_path_style              = true
    use_lockfile                = true
  }
}

provider "cloudflare" {}

locals {
  account_id = "b13c1cf2483bdad430b91ae25126e984"
  zone_id    = "e45d9809405489b5bac3b5d3e4e1a9aa"
}

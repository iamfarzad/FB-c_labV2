# Email DNS Setup – farzadbayat.com

## Overview
This document details the full setup for email sending and receiving using **Gmail (Google Workspace)** and **Amazon SES** with proper SPF, DKIM, and DMARC configuration for the domain **farzadbayat.com** hosted on **Dynadot**.

The goal is:
- Reliable email delivery (transactional + personal)
- Improved sender reputation
- Compliance with DMARC/anti-spoofing rules
- Support for multiple email services (Google & Amazon SES)

---

## 1. MX Records (Mail Routing)

Purpose: Direct all incoming mail for `@farzadbayat.com` to Google’s mail servers.

| Subdomain | Record Type | Priority | Destination              |
|-----------|------------|----------|--------------------------|
| @         | MX         | 0        | ASPMX.L.GOOGLE.COM       |
| @         | MX         | 5        | ALT1.ASPMX.L.GOOGLE.COM  |
| @         | MX         | 5        | ALT2.ASPMX.L.GOOGLE.COM  |
| @         | MX         | 10       | ALT3.ASPMX.L.GOOGLE.COM  |
| @         | MX         | 10       | ALT4.ASPMX.L.GOOGLE.COM  |

---

## 2. SPF Record (Sender Policy Framework)

Purpose: Authorize sending mail via **Amazon SES** and **Google**.

| Subdomain | Record Type | Value                                                                 |
|-----------|-------------|-----------------------------------------------------------------------|
| @         | TXT         | `v=spf1 include:amazonses.com include:_spf.google.com ~all`           |

- `include:amazonses.com` → Allows Amazon SES to send on behalf of the domain.
- `include:_spf.google.com` → Allows Gmail to send on behalf of the domain.
- `~all` → Soft fail for unauthorized senders.

---

## 3. DKIM (DomainKeys Identified Mail)

Purpose: Cryptographic signature to prove the email was sent from authorized servers.

| Subdomain      | Record Type | Value (Example – Amazon SES)                                      |
|----------------|-------------|-------------------------------------------------------------------|
| resend._domainkey | TXT     | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...`                     |

- This is generated inside Amazon SES or Gmail settings.
- For Amazon SES: Added via `resend._domainkey` (or whatever name SES provides).
- For Gmail (Google Workspace): If using, Google generates a separate DKIM TXT record.

---

## 4. DMARC (Domain-based Message Authentication, Reporting & Conformance)

Purpose: Define how mail servers handle unauthorized mail claiming to be from the domain.

| Subdomain | Record Type | Value                                                                                                    |
|-----------|-------------|----------------------------------------------------------------------------------------------------------|
| _dmarc    | TXT         | `v=DMARC1; p=quarantine; rua=mailto:you@farzadbayat.com; ruf=mailto:you@farzadbayat.com; fo=1; adkim=s; aspf=s` |

**Explanation:**
- `v=DMARC1` → Protocol version.
- `p=quarantine` → Suspicious messages go to spam, not rejected outright.
- `rua=mailto:you@farzadbayat.com` → Aggregate reports sent here.
- `ruf=mailto:you@farzadbayat.com` → Forensic (failure) reports sent here.
- `fo=1` → Generate reports for any failure.
- `adkim=s` & `aspf=s` → Strict alignment for DKIM & SPF.

---

## 5. CNAME Records

Purpose: Support services like Vercel hosting & Dynadot webmail.

| Subdomain     | Record Type | Destination                              |
|---------------|-------------|------------------------------------------|
| www           | CNAME       | cname.vercel-dns.com                     |
| default._domainkey | CNAME  | clients._domainkey.webhost.dynadot.com   |

---

## 6. TTL (Time to Live)

All records are set to **5 minutes** in Dynadot for faster propagation during setup changes.

---

## 7. Verification Steps

After records are added:
1. Run [MXToolbox](https://mxtoolbox.com/) checks for:
   - MX Lookup
   - SPF Record
   - DKIM Record
   - DMARC Record
2. Verify Amazon SES domain in AWS console.
3. Send test emails to Gmail, Outlook, and ProtonMail to confirm inbox placement.
4. Review DMARC reports after 24–48 hours.

---

## 8. Maintenance Notes

- **Only one SPF TXT record for @** — if adding more services, merge them into the existing record.
- **Rotate DKIM keys** periodically if required by Amazon SES or Gmail.
- **Review DMARC reports** monthly to ensure no unauthorized sending.
- Update MX records only if switching email hosting providers.

---

**Last Updated:** 12 Aug 2025  
**Maintainer:** Farzad Bayat
# Mitul Rahman — Computer Networking & IT Support Portfolio

A dark cyber-network themed portfolio website and interactive networking lab showcasing routing, switching, firewall security, Linux administration, packet diagnostics, and copyable CLI configurations.

## Folder Structure

Keep all HTML files in the same root directory so relative links between the main portfolio, the 5-project lab overview, and each individual project page work seamlessly:

```text
/
├── index.html                                         # Main portfolio page (Hero, Core Skill, 5 Topology Cards, Router CLI, EmailJS Contact)
├── network-projects.html                              # Interactive 5-project switcher with clickable SVG topology & CLI inspector
├── project-01-enterprise-vlan-ospf.html               # Project 01: Enterprise Multi-Router & VLAN Lab Topology
├── project-02-mikrotik-dual-wan-qos.html              # Project 02: MikroTik Dual-WAN Failover & QoS Queue Lab
├── project-03-ospf-acl-campus-backbone.html           # Project 03: Multi-Area OSPF & ACL Campus Backbone
├── project-04-linux-dhcp-dns-dmz.html                 # Project 04: Linux DHCP, DNS & Firewall DMZ Lab
├── project-05-wireshark-powershell-diagnostics.html   # Project 05: Wireshark & PowerShell Packet Diagnostics
└── README.md                                          # Project documentation
```

## Included Networking Projects (01 — 05)

1. **01. Enterprise Multi-Router & VLAN Lab Topology** (`project-01-enterprise-vlan-ospf.html`)
   - MikroTik Edge Gateway NAT/PAT & OSPF peering, Cisco IOS multi-area OSPF & ACLs, 802.1Q VLAN trunking, and DHCP/DNS/Wireshark/PowerShell diagnostics.
2. **02. MikroTik Dual-WAN Failover & QoS Queue Lab** (`project-02-mikrotik-dual-wan-qos.html`)
   - ISP1 primary and ISP2 backup failover using recursive gateway routes, source NAT masquerading, and bandwidth queue management.
3. **03. Multi-Area OSPF & ACL Campus Backbone** (`project-03-ospf-acl-campus-backbone.html`)
   - Area 0 backbone summarization, Area 10/20 campus routing, MD5 authentication, and extended ACL access control.
4. **04. Linux DHCP, DNS & Firewall DMZ Lab** (`project-04-linux-dhcp-dns-dmz.html`)
   - Linux network interface setup, user & file permissions, DNS resolution verification, DMZ routing, and `iptables` firewall rules.
5. **05. Wireshark & PowerShell Packet Diagnostics** (`project-05-wireshark-powershell-diagnostics.html`)
   - Wireshark display filters, PowerShell connectivity & DNS checks, IPv4 route/ARP inspection, and latency/MTU probing.

## EmailJS Contact Form Setup

The contact form in `index.html` uses `@emailjs/browser` with:
- **Service ID:** `service_xnol7s7`
- **Template ID:** `template_hgplucf`
- **Public Key:** `cXoNW7DGfYR-NQnV4`

Make sure your EmailJS template includes matching variables (`{{from_name}}`, `{{from_email}}`, `{{subject}}`, `{{message}}`, `{{to_email}}`) and allows your website domain in the EmailJS dashboard.

## Running Locally or Hosting

- **Local Preview:** Open `index.html` in any modern web browser or serve the folder with a local static server (e.g., VS Code Live Server).
- **Deployment:** Upload all `.html` files together to GitHub Pages, Netlify, Vercel, or any standard web hosting directory.
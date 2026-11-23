/**
 * Cisco Networking CLI Commands Database
 * Segregated cleanly into:
 * 1. Switching & VLANs (একদিকে VLAN & INTER-VLAN)
 * 2. Routing Protocols (একদিকে রাউটিং: Static, RIP, OSPF, EIGRP, Dynamic)
 * 3. Network Services & Security (DNS, DHCP, ACL)
 */

const COMMANDS_DATABASE = {
  // ==========================================
  // SECTION 1: SWITCHING & VLANs (একদিকে VLAN & INTER-VLAN)
  // ==========================================
  vlan: {
    id: "vlan",
    title: "VLAN (Virtual Local Area Network)",
    aliases: ["vlan", "vlans", "vlan config", "switchport", "trunk"],
    category: "switching",
    categoryTitle: "Switching & VLANs (সুইচিং ও ভিএলএএন)",
    badge: "Layer 2 Switching",
    icon: "🔀",
    description: "VLAN ব্যবহার করে একটি ফিজিক্যাল সুইচকে লজিক্যালি আলাদা আলাদা ব্রডকাস্ট ডোমেইনে ভাগ করা যায়। নিচে বেসিক VLAN তৈরি, পোর্ট অ্যাসাইন ও ট্রাঙ্ক কনফিগারেশন দেওয়া হলো।",
    summary: "Create VLANs, assign access ports, and configure 802.1Q trunking.",
    steps: [
      {
        step: 1,
        title: "VLAN তৈরি ও নাম দেওয়া (Create & Name VLAN)",
        code: `Switch> enable
Switch# configure terminal
Switch(config)# vlan 10
Switch(config-vlan)# name IT_Dept
Switch(config-vlan)# exit

Switch(config)# vlan 20
Switch(config-vlan)# name HR_Dept
Switch(config-vlan)# exit`
      },
      {
        step: 2,
        title: "সুইচ পোর্টে VLAN অ্যাসাইন করা (Assign Access Port)",
        code: `Switch(config)# interface FastEthernet 0/1
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 10
Switch(config-if)# no shutdown
Switch(config-if)# exit

! একাধিক পোর্টে একসাথে VLAN দেওয়া (Port Range):
Switch(config)# interface range FastEthernet 0/2 - 10
Switch(config-if-range)# switchport mode access
Switch(config-if-range)# switchport access vlan 20
Switch(config-if-range)# exit`
      },
      {
        step: 3,
        title: "ট্রাঙ্ক পোর্ট কনফিগার করা (Configure 802.1Q Trunk Port)",
        code: `Switch(config)# interface GigabitEthernet 0/1
Switch(config-if)# switchport trunk encapsulation dot1q   ! (শুধুমাত্র L3 সুইচে প্রয়োজন)
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20
Switch(config-if)# no shutdown
Switch(config-if)# exit`
      }
    ],
    verification: [
      "Switch# show vlan brief          ! সব VLAN ও অ্যাসাইন করা পোর্ট দেখার জন্য",
      "Switch# show interfaces trunk    ! ট্রাঙ্ক পোর্টের স্ট্যাটাস দেখার জন্য",
      "Switch# show interfaces switchport ! পোর্ট মোড (Access/Trunk) চেক করতে"
    ]
  },

  "inter-vlan": {
    id: "inter-vlan",
    title: "Inter-VLAN Routing (ইন্টার-ভিএলএএন রাউটিং)",
    aliases: ["inter vlan", "inter-vlan", "intar vlan", "router on a stick", "sub-interface", "roas"],
    category: "switching",
    categoryTitle: "Switching & VLANs (সুইচিং ও ভিএলএএন)",
    badge: "Router on a Stick",
    icon: "🔌",
    description: "আলাদা আলাদা VLAN এর মধ্যে যোগাযোগ স্থাপনের জন্য রাউটারে সাব-ইন্টারফেস (Sub-interfaces) তৈরি করে 802.1Q এনক্যাপসুলেশন করা হয়।",
    summary: "Router-on-a-Stick configuration using sub-interfaces and 802.1Q encapsulation.",
    steps: [
      {
        step: 1,
        title: "রাউটারের মেইন ইন্টারফেস আপ করা (Enable Physical Interface)",
        code: `Router> enable
Router# configure terminal
Router(config)# interface GigabitEthernet 0/0
Router(config-if)# no shutdown
Router(config-if)# exit`
      },
      {
        step: 2,
        title: "VLAN 10 এর জন্য সাব-ইন্টারফেস কনফিগার (Sub-interface for VLAN 10)",
        code: `Router(config)# interface GigabitEthernet 0/0.10
Router(config-subif)# encapsulation dot1Q 10
Router(config-subif)# ip address 192.168.10.1 255.255.255.0
Router(config-subif)# exit`
      },
      {
        step: 3,
        title: "VLAN 20 এর জন্য সাব-ইন্টারফেস কনফিগার (Sub-interface for VLAN 20)",
        code: `Router(config)# interface GigabitEthernet 0/0.20
Router(config-subif)# encapsulation dot1Q 20
Router(config-subif)# ip address 192.168.20.1 255.255.255.0
Router(config-subif)# exit`
      },
      {
        step: 4,
        title: "সুইচ পোর্টে ট্রাঙ্ক মোড চালু করা (Switch Port to Trunk)",
        code: `! সুইচের যে পোর্টটি রাউটারের সাথে যুক্ত তা ট্রাঙ্ক করতে হবে:
Switch(config)# interface GigabitEthernet 0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# no shutdown
Switch(config-if)# exit`
      }
    ],
    verification: [
      "Router# show ip interface brief  ! সাব-ইন্টারফেসগুলোর আইপি ও স্ট্যাটাস দেখতে",
      "Router# show ip route            ! কানেক্টেড VLAN গুলোর রুট দেখতে",
      "Switch# show interfaces trunk    ! সুইচের ট্রাঙ্ক পোর্ট এক্টিভ আছে কিনা"
    ]
  },

  // ==========================================
  // SECTION 2: ROUTING PROTOCOLS (একদিকে রাউটিং প্রোটোকলসমূহ)
  // ==========================================
  static: {
    id: "static",
    title: "Static Routing (স্ট্যাটিক রাউটিং)",
    aliases: ["satik", "static", "satik routing", "static routing", "static-route", "ip route", "default route"],
    category: "routing",
    categoryTitle: "Routing Protocols (রাউটিং প্রোটোকলসমূহ)",
    badge: "Manual Routing",
    icon: "📌",
    description: "স্ট্যাটিক রাউটিং-এ নেটওয়ার্ক অ্যাডমিনিস্ট্রেটর নিজে নির্দিষ্ট ডেস্টিনেশনে ট্রাফিকের নেক্সট-হপ (Next-Hop) আইপি বা এক্সিট ইন্টারফেস সেট করে দেন।",
    summary: "Standard static routes, default routes (0.0.0.0 0.0.0.0), and floating static backup routes.",
    steps: [
      {
        step: 1,
        title: "স্ট্যান্ডার্ড স্ট্যাটিক রাউট (Standard Static Route)",
        code: `! সিনট্যাক্স: ip route <dest_network> <subnet_mask> <next_hop_ip OR exit_interface>

Router> enable
Router# configure terminal

! Next-Hop IP দিয়ে রাউট দেওয়া:
Router(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2

! Exit Interface দিয়ে রাউট দেওয়া:
Router(config)# ip route 192.168.3.0 255.255.255.0 GigabitEthernet 0/1`
      },
      {
        step: 2,
        title: "ডিফল্ট স্ট্যাটিক রাউট (Default Static Route - Gateway of Last Resort)",
        code: `! যেকোনো অজানা আইপির জন্য ইন্টারনেটের ডিফল্ট রাউট:
Router(config)# ip route 0.0.0.0 0.0.0.0 10.0.0.2
! অথবা:
Router(config)# ip route 0.0.0.0 0.0.0.0 Serial 0/1/0`
      },
      {
        step: 3,
        title: "ফ্লোটিং স্ট্যাটিক ব্যাকআপ রাউট (Floating Static Backup Route)",
        code: `! ব্যাকআপ লাইনে যাওয়ার জন্য হাই AD (যেমন 10) দেওয়া হয়:
Router(config)# ip route 192.168.2.0 255.255.255.0 10.0.0.2        ! Primary (AD=1)
Router(config)# ip route 192.168.2.0 255.255.255.0 20.0.0.2 10     ! Backup (AD=10)`
      }
    ],
    verification: [
      "Router# show ip route static    ! শুধুমাত্র স্ট্যাটিক রাউটগুলো দেখতে",
      "Router# show ip route           ! সম্পূর্ণ রাউটিং টেবিল (S চিহ্নিত এন্ট্রি)",
      "Router# traceroute 192.168.2.1  ! ট্রাফিক কোন পথ দিয়ে যাচ্ছে তা দেখতে"
    ]
  },

  rip: {
    id: "rip",
    title: "RIPv2 (Routing Information Protocol v2)",
    aliases: ["rip", "rip routing", "ripv2", "rip config"],
    category: "routing",
    categoryTitle: "Routing Protocols (রাউটিং প্রোটোকলসমূহ)",
    badge: "Distance Vector",
    icon: "⚡",
    description: "RIP হলো একটি Distance Vector রাউটিং প্রোটোকল যার Hop Count লিমিট সর্বোচ্চ ১৫। ছোট নেটওয়ার্কে RIPv2 ব্যবহার করা সহজ।",
    summary: "Configure RIPv2 dynamic routing, advertise networks, and disable auto-summary.",
    steps: [
      {
        step: 1,
        title: "RIPv2 সক্রিয় করা ও অটো-সামারি বন্ধ করা (Enable RIPv2)",
        code: `Router> enable
Router# configure terminal
Router(config)# router rip
Router(config-router)# version 2
Router(config-router)# no auto-summary`
      },
      {
        step: 2,
        title: "নেটওয়ার্ক অ্যাডভার্টাইজ করা (Advertise Networks)",
        code: `! রাউটারের সাথে সরাসরি যুক্ত মেজর ক্লাস নেটওয়ার্কগুলো যোগ করুন:
Router(config-router)# network 192.168.10.0
Router(config-router)# network 192.168.20.0
Router(config-router)# network 10.0.0.0`
      },
      {
        step: 3,
        title: "প্যাসিভ ইন্টারফেস ও ডিফল্ট রাউট শেয়ার (Optional)",
        code: `! ল্যান ইন্টারফেসে অপ্রয়োজনীয় RIP আপডেট পাঠানো বন্ধ করতে:
Router(config-router)# passive-interface GigabitEthernet 0/0

! ইন্টারনেটের ডিফল্ট রাউট সবার কাছে পাঠাতে:
Router(config-router)# default-information originate
Router(config-router)# exit`
      }
    ],
    verification: [
      "Router# show ip protocols      ! সক্রিয় রাউটিং প্রোটোকল চেক করতে",
      "Router# show ip route rip      ! RIP এর মাধ্যমে প্রাপ্ত রুট দেখতে",
      "Router# debug ip rip           ! রিয়েলটাইম RIP প্যাকেট দেখতে"
    ]
  },

  ospf: {
    id: "ospf",
    title: "OSPF (Open Shortest Path First)",
    aliases: ["ospf", "ospf routing", "ospfv2", "ospf config"],
    category: "routing",
    categoryTitle: "Routing Protocols (রাউটিং প্রোটোকলসমূহ)",
    badge: "Link-State Routing",
    icon: "🚀",
    description: "OSPF একটি বহুল ব্যবহৃত হাই-পারফরম্যান্স Link-State রাউটিং প্রোটোকল। এটি Dijkstra SPF অ্যালগরিদম ব্যবহার করে অতি দ্রুত কনভার্জ করে।",
    summary: "Single & Multi-area OSPFv2, Router-ID, Wildcard masks, and passive interfaces.",
    steps: [
      {
        step: 1,
        title: "OSPF প্রসেস ও রাউটার-আইডি সেট করা (Enable OSPF & Router-ID)",
        code: `Router> enable
Router# configure terminal
Router(config)# router ospf 1
Router(config-router)# router-id 1.1.1.1`
      },
      {
        step: 2,
        title: "ওয়াইল্ডকার্ড মাস্ক দিয়ে নেটওয়ার্ক ঘোষণা (Network with Wildcard)",
        code: `! সিনট্যাক্স: network <network-ip> <wildcard-mask> area <area-id>
! 255.255.255.0 (/24) এর ওয়াইল্ডকার্ড = 0.0.0.255
! 255.255.255.252 (/30) এর ওয়াইল্ডকার্ড = 0.0.0.3

Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# network 10.0.0.0 0.0.0.3 area 0`
      },
      {
        step: 3,
        title: "প্যাসিভ ইন্টারফেস ও ডিফল্ট ইনফরমেশন (Passive Interface)",
        code: `! ইউজার পোর্টে হ্যালো প্যাকেট পাঠানো বন্ধ করা:
Router(config-router)# passive-interface GigabitEthernet 0/0

! ডিফল্ট রাউট OSPF এর ভেতরে ইনজেক্ট করা:
Router(config-router)# default-information originate
Router(config-router)# exit`
      }
    ],
    verification: [
      "Router# show ip ospf neighbor   ! নেইবার রিলেশনশিপ ও স্ট্যাটাস (FULL) দেখতে",
      "Router# show ip route ospf      ! OSPF এর মাধ্যমে পাওয়া রাউটগুলো দেখতে (O চিহ্নিত)",
      "Router# show ip ospf interface  ! OSPF ইন্টারফেস কস্ট ও টাইমার দেখতে"
    ]
  },

  eigrp: {
    id: "eigrp",
    title: "EIGRP (Enhanced Interior Gateway Routing Protocol)",
    aliases: ["eigrp", "eigrp routing", "eigrp config", "cisco eigrp"],
    category: "routing",
    categoryTitle: "Routing Protocols (রাউটিং প্রোটোকলসমূহ)",
    badge: "Advanced Distance Vector",
    icon: "🛡️",
    description: "সিসকোর অত্যন্ত জনপ্রিয় অ্যাডভান্সড ডিস্ট্যান্স ভেক্টর প্রোটোকল। এটি DUAL অ্যালগরিদম ব্যবহার করে ব্যাকআপ পাথ (Feasible Successor) তৈরি রাখে।",
    summary: "Configure EIGRP with AS Number, Wildcard masks, no auto-summary, and passive interface.",
    steps: [
      {
        step: 1,
        title: "EIGRP প্রসেস ও AS নম্বর সেট করা (Enable EIGRP)",
        code: `! সতর্কতা: দুটি রাউটারের মধ্যে EIGRP AS Number অবশ্যই সমান হতে হবে
Router> enable
Router# configure terminal
Router(config)# router eigrp 100
Router(config-router)# no auto-summary`
      },
      {
        step: 2,
        title: "নেটওয়ার্ক ঘোষণা করা (Advertise Networks)",
        code: `Router(config-router)# network 192.168.10.0 0.0.0.255
Router(config-router)# network 192.168.20.0 0.0.0.255
Router(config-router)# network 10.1.1.0 0.0.0.3`
      },
      {
        step: 3,
        title: "প্যাসিভ ইন্টারফেস (Passive Interface)",
        code: `Router(config-router)# passive-interface GigabitEthernet 0/0
Router(config-router)# exit`
      }
    ],
    verification: [
      "Router# show ip eigrp neighbors   ! নেইবার টেবিল দেখতে",
      "Router# show ip route eigrp       ! EIGRP রুটগুলো দেখতে (D চিহ্নিত)",
      "Router# show ip eigrp topology    ! সাকসেসর ও ফিজিবল সাকসেসর টপোলজি দেখতে"
    ]
  },

  dynamic: {
    id: "dynamic",
    title: "Dynamic Routing Overview (ডায়নামিক রাউটিং গাইড)",
    aliases: ["daynamik", "daynamik routing", "dynamic", "dynamic routing", "dynamic-routing", "touting"],
    category: "routing",
    categoryTitle: "Routing Protocols (রাউটিং প্রোটোকলসমূহ)",
    badge: "Protocol Master",
    icon: "🌐",
    description: "ডায়নামিক রাউটিং-এ রাউটারগুলো স্বয়ংক্রিয়ভাবে একে অপরের সাথে রাউটিং তথ্য শেয়ার করে এবং বিকল্প পথ বেছে নেয়। প্রধান প্রোটোকলসমূহ: RIP, OSPF, EIGRP।",
    summary: "Dynamic routing comparison, decision matrix, and command shortcuts.",
    steps: [
      {
        step: 1,
        title: "রাউটিং প্রোটোকল তুলনামূলক তালিকা (Comparison Matrix)",
        code: `+-----------+----------------------+----------+-------------+-----------------------+
| Protocol  | Type                 | Metric   | AD (Trust)  | Best Used In          |
+-----------+----------------------+----------+-------------+-----------------------+
| RIPv2     | Distance Vector      | Hop Count| 120         | Small networks (<15)  |
| EIGRP     | Advanced Dist-Vector | Band/Delay| 90         | Cisco-only enterprise |
| OSPF      | Link-State           | Cost (BW)| 110         | Standard Multi-vendor |
| BGP       | Path-Vector          | AS Path  | 20/200      | Internet & ISPs       |
+-----------+----------------------+----------+-------------+-----------------------+`
      },
      {
        step: 2,
        title: "ডায়নামিক রাউটিং ৩-স্টেপ নিয়ম (3-Step Rule)",
        code: `1. রাউটার প্রসেস চালু করা: router [rip | ospf 1 | eigrp 100]
2. কানেক্টেড নেটওয়ার্ক ঘোষণা করা: network <ip> [wildcard] [area 0]
3. ইউজার ল্যান পোর্ট প্যাসিভ করা: passive-interface <interface>`
      }
    ],
    verification: [
      "Router# show ip protocols        ! সক্রিয় সব রাউটিং প্রোটোকল দেখতে",
      "Router# show ip route            ! সম্পূর্ণ রাউটিং টেবিল দেখতে"
    ]
  },

  // ==========================================
  // SECTION 3: SERVICES & SECURITY (একদিকে DNS, DHCP, ACL)
  // ==========================================
  dns: {
    id: "dns",
    title: "DNS (Domain Name System Configuration)",
    aliases: ["dns", "dns config", "ip name-server", "domain-lookup", "domain lookup"],
    category: "services",
    categoryTitle: "Network Services & Security (ডিএনএস ও নেটওয়ার্ক সার্ভিস)",
    badge: "Name Resolution",
    icon: "🌍",
    description: "সিসকো রাউটারে DNS কনফিগার করলে আইপি অ্যাড্রেসের বদলে ডোমেইন নাম দিয়ে সরাসরি পিং বা কানেক্ট করা যায়।",
    summary: "Configure DNS domain-lookup, name-server IPs, domain name, and static host mappings.",
    steps: [
      {
        step: 1,
        title: "DNS লুকআপ সচল করা (Enable DNS Domain Lookup)",
        code: `Router> enable
Router# configure terminal
Router(config)# ip domain-lookup`
      },
      {
        step: 2,
        title: "DNS সার্ভার আইপি যোগ করা (Specify DNS Name Servers)",
        code: `! প্রাইমারি ও সেকেন্ডারি DNS সার্ভার যোগ করুন:
Router(config)# ip name-server 8.8.8.8 8.8.4.4
Router(config)# ip name-server 1.1.1.1`
      },
      {
        step: 3,
        title: "ডিফল্ট ডোমেইন ও স্ট্যাটিক হোস্ট ম্যাপ (Static Host Mapping)",
        code: `Router(config)# ip domain-name mycompany.local

! DNS ছাড়াই লোকাল হোস্ট নামের সাথে আইপি ম্যাপ করা:
Router(config)# ip host Core-Switch 192.168.1.2
Router(config)# ip host WebServer 192.168.10.50
Router(config)# exit`
      }
    ],
    verification: [
      "Router# show hosts              ! ক্যাশ করা এবং স্ট্যাটিক হোস্ট এন্ট্রি দেখতে",
      "Router# ping google.com         ! ডোমেইন রেজল্যুশন টেস্ট করতে",
      "Router# ping Core-Switch        ! লোকাল হোস্ট ম্যাপিং টেস্ট করতে"
    ]
  },

  dhcp: {
    id: "dhcp",
    title: "DHCP (Dynamic Host Configuration Protocol)",
    aliases: ["dhcp", "dhcp pool", "dhcp config", "dhcp server", "ip helper"],
    category: "services",
    categoryTitle: "Network Services & Security (ডিএনএস ও নেটওয়ার্ক সার্ভিস)",
    badge: "Auto IP Assignment",
    icon: "💻",
    description: "সিসকো রাউটারকে একটি DHCP সার্ভার হিসেবে কনফিগার করে ক্লায়েন্ট পিসিতে স্বয়ংক্রিয়ভাবে IP, Subnet Mask, Gateway ও DNS পাঠানো যায়।",
    summary: "Configure DHCP pools, exclude static IP ranges, and configure DHCP Relay Agent.",
    steps: [
      {
        step: 1,
        title: "স্ট্যাটিক আইপি এক্সক্লুড করা (Exclude Static Reserved IPs)",
        code: `! গেটওয়ে ও সার্ভারের আইপি যেন DHCP থেকে কাউকে না দেওয়া হয়:
Router> enable
Router# configure terminal
Router(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.10
Router(config)# ip dhcp excluded-address 192.168.1.254`
      },
      {
        step: 2,
        title: "DHCP পুল তৈরি ও প্যারামিটার সেট (Create DHCP Pool)",
        code: `Router(config)# ip dhcp pool LAN_CLIENTS
Router(dhcp-config)# network 192.168.1.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.1.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# domain-name mylab.lan
Router(dhcp-config)# lease 7 0 0        ! ৭ দিন লিজ টাইম
Router(dhcp-config)# exit`
      },
      {
        step: 3,
        title: "DHCP রিলে এজেন্ট / IP Helper Address (Relay Agent)",
        code: `! ভিন্ন সাবনেটে সেন্ট্রাল DHCP সার্ভার থাকলে ক্লায়েন্ট ইন্টারফেসে হেল্পার বসানো:
Router(config)# interface GigabitEthernet 0/0
Router(config-if)# ip helper-address 192.168.100.5
Router(config-if)# exit`
      }
    ],
    verification: [
      "Router# show ip dhcp binding      ! কোন ক্লায়েন্ট কোন আইপি পেয়েছে দেখতে",
      "Router# show ip dhcp pool         ! পুলে কয়টি আইপি খালি বা লিজড আছে দেখতে"
    ]
  },

  acl: {
    id: "acl",
    title: "ACL (Access Control Lists - Standard & Extended)",
    aliases: ["acl", "access-list", "acl config", "firewall rules", "access control"],
    category: "services",
    categoryTitle: "Network Services & Security (ডিএনএস ও নেটওয়ার্ক সার্ভিস)",
    badge: "Traffic Filtering",
    icon: "🛡️",
    description: "ACL হলো রাউটারের প্যাকেট ফিল্টারিং টুল। এর মাধ্যমে ট্রাফিক পারমিট বা ডিনাই করে নেটওয়ার্ক সিকিউরিটি বজায় রাখা হয়।",
    summary: "Standard (1-99), Extended (100-199), and Named ACLs with port filtering.",
    steps: [
      {
        step: 1,
        title: "স্ট্যান্ডার্ড এসিএল (Standard ACL: 1-99) - শুধু সোর্স আইপি",
        code: `Router> enable
Router# configure terminal

! নির্দিষ্ট আইপি ব্লক করে বাকি সবাইকে অনুমতি দেওয়া:
Router(config)# access-list 10 deny host 192.168.1.100
Router(config)# access-list 10 permit any

! ইন্টারফেসে আউটবাউন্ডে বসানো:
Router(config)# interface GigabitEthernet 0/1
Router(config-if)# ip access-group 10 out
Router(config-if)# exit`
      },
      {
        step: 2,
        title: "এক্সটেন্ডেড এসিএল (Extended ACL: 100-199) - সোর্স, ডেস্টিনেশন ও পোর্ট",
        code: `! উদাহরণ: ওয়েব সার্ভারে শুধু HTTP/HTTPS পারমিট ও পিং (ICMP) ব্লক:
Router(config)# access-list 101 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.50 eq 80
Router(config)# access-list 101 permit tcp 192.168.1.0 0.0.0.255 host 10.0.0.50 eq 443
Router(config)# access-list 101 deny icmp 192.168.1.0 0.0.0.255 host 10.0.0.50
Router(config)# access-list 101 permit ip any any

! ইন্টারফেসে ইনবাউন্ডে বসানো:
Router(config)# interface GigabitEthernet 0/0
Router(config-if)# ip access-group 101 in
Router(config-if)# exit`
      }
    ],
    verification: [
      "Router# show access-lists         ! সব ACL রুল ও প্যাকেট ম্যাচের সংখ্যা দেখতে",
      "Router# show ip interface g0/0    ! ইন্টারফেসে কোন ACL বসানো আছে দেখতে"
    ]
  }
};

/**
 * Routing Selection Menu Options for interactive CLI
 */
const ROUTING_MENU = [
  { key: "1", id: "static", label: "Static Routing (satik / স্ট্যাটিক রাউটিং)", badge: "Manual" },
  { key: "2", id: "rip", label: "RIPv2 (Routing Information Protocol)", badge: "Distance-Vector" },
  { key: "3", id: "ospf", label: "OSPF (Open Shortest Path First)", badge: "Link-State" },
  { key: "4", id: "eigrp", label: "EIGRP (Enhanced Interior Gateway)", badge: "Advanced DV" },
  { key: "5", id: "dynamic", label: "Dynamic Routing Overview (ডায়নামিক গাইড)", badge: "Overview" }
];

/**
 * Categories configuration for side-by-side divided views
 */
const CATEGORIES_CONFIG = {
  switching: {
    id: "switching",
    title: "VLAN & Inter-VLAN (একদিকে সুইচিং)",
    description: "VLAN তৈরি, পোর্ট অ্যাসাইন, ট্রাঙ্কিং ও ইন্টার-ভিএলএএন রাউটিং কনফিগারেশন",
    icon: "🔀",
    accent: "#38bdf8",
    items: ["vlan", "inter-vlan"]
  },
  routing: {
    id: "routing",
    title: "Routing Protocols (একদিকে রাউটিং)",
    description: "স্ট্যাটিক, RIP, OSPF, EIGRP এবং ডায়নামিক রাউটিং প্রোটোকল",
    icon: "🧭",
    accent: "#10b981",
    items: ["static", "rip", "ospf", "eigrp", "dynamic"]
  },
  services: {
    id: "services",
    title: "DNS & Services (অন্য দিকে সার্ভিস ও সিকিউরিটি)",
    description: "DNS ডোমেইন লুকআপ, DHCP অটো-আইপি অ্যাসাইন এবং ACL ফিল্টারিং",
    icon: "🛡️",
    accent: "#f59e0b",
    items: ["dns", "dhcp", "acl"]
  }
};

// Export to window
if (typeof window !== "undefined") {
  window.COMMANDS_DATABASE = COMMANDS_DATABASE;
  window.ROUTING_MENU = ROUTING_MENU;
  window.CATEGORIES_CONFIG = CATEGORIES_CONFIG;
}

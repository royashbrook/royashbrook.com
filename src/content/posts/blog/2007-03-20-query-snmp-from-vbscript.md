---
title: "query snmp from vbscript"
date: 2007-03-20
path: "2007/03/20/query-snmp-from-vbscript"
---

if anyone finds a way to do more, let me know. i have not found a way to query a specific oid via vbscript without using a com object specifically for this or an external command.

this method uses the [wmi](https://en.wikipedia.org/wiki/Windows_Management_Instrumentation) [snmp](https://en.wikipedia.org/wiki/Simple_Network_Management_Protocol) provider. valid values for the class variable below, as far as i know,  are currently:
- SNMP_RFC1213_MIB_snmp
- SNMP_RFC1213_MIB_ip
- SNMP_RFC1213_MIB_ipRouteTable
- SNMP_RFC1213_MIB_ipAddrTable
- SNMP_RFC1213_MIB_ipNetToMediaTable
- SNMP_RFC1213_MIB_interfaces
- SNMP_RFC1213_MIB_ifTable
- SNMP_RFC1213_MIB_icmp
- SNMP_RFC1213_MIB_tcp
- SNMP_RFC1213_MIB_tcpConnTable
- SNMP_RFC1213_MIB_egp
- SNMP_RFC1213_MIB_egpNeighTable
- SNMP_RFC1213_MIB_udp
- SNMP_RFC1213_MIB_udpTable
- SNMP_RFC1213_MIB_system
- SNMP_RFC1213_MIB_atTable

using the wmi cim studio tools available from microsoft for free download, you can find these if you browse to root/snmp/smir and look in snmpmacro/snmpobjecttype

<script src="https://gist.github.com/royashbrook/d8c455444de15819decdd9761603efa0.js"></script>

sample command line syntax:

TestSQL.exe c:\test\t.sql 100 "server=localhost;database=zipcode;integrated security=sspi;Pooling=False;connect timeout=0;" false

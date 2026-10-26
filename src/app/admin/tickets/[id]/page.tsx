"use client";
import { useParams } from "next/navigation";
import { AdminTicketDetail } from "@/components/admin-ticket-detail";
export default function AdminTicketPage(){const{id}=useParams<{id:string}>();return <AdminTicketDetail id={id}/>;}

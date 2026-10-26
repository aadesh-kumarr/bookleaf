"use client";
import { useParams } from "next/navigation";
import { TicketDetail } from "@/components/ticket-detail";
export default function TicketPage(){const{id}=useParams<{id:string}>();return <TicketDetail id={id}/>;}

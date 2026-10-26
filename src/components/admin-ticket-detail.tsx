"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import { ArrowLeft,Bot,Check,Clock3,MessageSquareText,Send,StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card,CardContent,CardHeader,CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge as StatusBadge } from "@/components/ui";
import { categories,labels,priorities,statuses,formatDate,formatTime,formatCurrency } from "@/lib/constants";
import { toast } from "sonner";

type Ticket={id:string;reference:string;subject:string;description:string;status:string;priority:string;category:string;aiCategory:string;aiPriority:string;aiConfidence:number|null;createdAt:string;author:{name:string;email:string;phone?:string;city?:string};book?:{title:string;status:string;royaltyPending:number;totalCopiesSold:number}|null;assignedTo?:{id:string;name:string}|null;messages:{id:string;body:string;isInternal:boolean;createdAt:string;sender:{name:string;role:string}}[]};

export function AdminTicketDetail({id}:{id:string}){
  const[ticket,setTicket]=useState<Ticket|null>(null);
  const[currentUserId,setCurrentUserId]=useState("");
  const[draft,setDraft]=useState("");
  const[internal,setInternal]=useState("");
  const[busy,setBusy]=useState("");

  async function load(){
    const r=await fetch(`/api/tickets/${id}`,{cache:"no-store"});
    if(r.ok)setTicket((await r.json()).ticket);
  }

  useEffect(()=>{
    let active=true;
    Promise.all([
      fetch(`/api/tickets/${id}`,{cache:"no-store"}).then(r=>r.ok?r.json():null),
      fetch("/api/me",{cache:"no-store"}).then(r=>r.ok?r.json():null),
    ]).then(([ticketData,userData])=>{
      if(!active)return;
      if(ticketData)setTicket(ticketData.ticket);
      if(userData)setCurrentUserId(userData.user.id);
    });
    return()=>{active=false};
  },[id]);

  const canAct=Boolean(ticket?.assignedTo?.id&&ticket.assignedTo.id===currentUserId);
  function shake(element?:HTMLElement|null){
    if(!element||window.matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    element.animate([
      {transform:"translateX(0)"},
      {transform:"translateX(-7px)"},
      {transform:"translateX(6px)"},
      {transform:"translateX(-5px)"},
      {transform:"translateX(4px)"},
      {transform:"translateX(0)"},
    ],{duration:380,easing:"ease-out"});
  }

  function requireAssignment(action:()=>void,element?:HTMLElement|null){
    if(!canAct){
      shake(element);
      toast.error("Assign this ticket to yourself first",{description:"Ticket actions are locked until assignment."});
      return;
    }
    action();
  }

  async function update(data:Record<string,unknown>){
    setBusy("update");
    const response=await fetch(`/api/tickets/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
    const result=await response.json();
    setBusy("");
    if(!response.ok){toast.error(result.error?.message??"Unable to update ticket");return;}
    if(data.assignToMe)toast.success("Ticket assigned to you");
    await load();
  }

  async function generate(){
    setBusy("ai");
    setDraft("");
    try{
      const response=await fetch("/api/ai/draft",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ticketId:id})});
      if(!response.ok){
        const result=await response.json().catch(()=>null);
        toast.error(result?.error?.message??"Unable to generate draft");
        return;
      }
      if(!response.body)throw new Error("Streaming response unavailable");
      const reader=response.body.getReader();
      const decoder=new TextDecoder();
      let nextDraft="";
      while(true){
        const{done,value}=await reader.read();
        if(done)break;
        nextDraft+=decoder.decode(value,{stream:true});
        setDraft(nextDraft);
      }
      nextDraft+=decoder.decode();
      setDraft(nextDraft);
      if(!nextDraft.trim())toast.error("The AI returned an empty draft");
    }catch{
      toast.error("Unable to generate draft right now");
    }finally{
      setBusy("");
    }
  }

  async function send(body:string,isInternal:boolean){
    if(!body.trim())return;
    setBusy(isInternal?"note":"send");
    const response=await fetch(`/api/tickets/${id}/responses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({body,isInternal})});
    const result=await response.json();
    setBusy("");
    if(!response.ok){toast.error(result.error?.message??"Unable to save response");return;}
    if(isInternal){setInternal("");toast.success("Internal note added");}
    else{setDraft("");toast.success("Response sent to author");}
    await load();
  }

  function sendResponse(event:React.MouseEvent<HTMLButtonElement>){
    requireAssignment(()=>{
      if(!draft.trim()){
        toast.error("Write or generate a response first");
        return;
      }
      void send(draft,false);
    },event.currentTarget);
  }

  function addInternalNote(event:React.MouseEvent<HTMLButtonElement>){
    requireAssignment(()=>{
      if(!internal.trim()){
        toast.error("Write an internal note first");
        return;
      }
      void send(internal,true);
    },event.currentTarget);
  }

  if(!ticket)return <p className="py-20 text-center text-[#817b80]">Loading ticket…</p>;
return <><Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#746f75]"><ArrowLeft size={17}/>Back to queue</Link><div className="mt-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-start"><div><div className="flex flex-wrap items-center gap-2"><StatusBadge value={ticket.priority}/><StatusBadge value={ticket.status}/><span className="text-xs font-semibold text-[#8a8388]">{ticket.reference}</span></div><h1 className="mt-3 text-3xl font-semibold tracking-[-.04em]">{ticket.subject}</h1><p className="mt-2 text-sm text-[#746f75]">{ticket.author.name} · Opened {formatDate(ticket.createdAt)}</p></div><Button variant="outline" onClick={()=>update({assignToMe:true})} disabled={busy==="update"||canAct}>{canAct?<Check size={17}/>:null}{canAct?"Assigned to you":ticket.assignedTo?`Take over from ${ticket.assignedTo.name}`:"Assign to me"}</Button></div>
<div className="mt-7 grid gap-6 xl:grid-cols-[1fr_360px]"><div className="space-y-6"><Card><CardHeader><CardTitle>Author’s query</CardTitle></CardHeader><CardContent><p className="whitespace-pre-wrap leading-7 text-[#5f595e]">{ticket.description}</p>{ticket.book&&<div className="mt-5 grid gap-3 rounded-xl bg-[#fff7f5] p-4 text-sm sm:grid-cols-3"><div><p className="text-xs text-[#8a8388]">Book</p><p className="mt-1 font-semibold">{ticket.book.title}</p></div><div><p className="text-xs text-[#8a8388]">Current stage</p><p className="mt-1 font-semibold">{ticket.book.status}</p></div><div><p className="text-xs text-[#8a8388]">Royalty pending</p><p className="mt-1 font-semibold">{formatCurrency(ticket.book.royaltyPending)}</p></div></div>}</CardContent></Card>
<Card><CardHeader><CardTitle>Conversation timeline</CardTitle><p className="mt-1 text-sm text-[#746f75]">A chronological record of the ticket and every follow-up.</p></CardHeader><CardContent className="max-h-[500px] overflow-y-auto pr-3 [scrollbar-color:#e8c7cc_transparent] [scrollbar-width:thin]"><div className="relative pr-3"><div aria-hidden="true" className="absolute bottom-5 left-[15px] top-5 w-px bg-[#eadbdd]"/><div className="space-y-5"><div className="relative grid grid-cols-[2rem_1fr] gap-3"><span className="relative z-10 grid size-8 place-items-center rounded-full border-4 border-white bg-[#f15d6f] text-white shadow-sm"><MessageSquareText size={13}/></span><div className="rounded-xl border border-[#f0dadd] bg-[#fff9f8] p-4"><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold">Ticket opened</p><p className="mt-0.5 text-xs text-[#817b80]">{ticket.author.name} · Author</p></div><time dateTime={ticket.createdAt} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#817b80]"><Clock3 size={13}/>{formatDate(ticket.createdAt)} · {formatTime(ticket.createdAt)}</time></div><p className="mt-3 text-sm leading-6 text-[#5f595e]">Original query submitted: {ticket.subject}</p></div></div>{ticket.messages.map(m=><div key={m.id} className="relative grid grid-cols-[2rem_1fr] gap-3"><span className={`relative z-10 grid size-8 place-items-center rounded-full border-4 border-white shadow-sm ${m.isInternal?"bg-amber-500 text-white":m.sender.role==="ADMIN"?"bg-[#e04d61] text-white":"bg-[#655e63] text-white"}`}>{m.isInternal?<StickyNote size={13}/>:<MessageSquareText size={13}/>}</span><div className={`rounded-xl border p-4 ${m.isInternal?"border-amber-200 bg-amber-50":m.sender.role==="ADMIN"?"border-[#f0dadd] bg-[#fff9f8]":"border-[#e8dfe0] bg-white"}`}><div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold">{m.isInternal?"Internal note":m.sender.role==="ADMIN"?"Support response":"Author reply"}</p><p className="mt-0.5 text-xs text-[#817b80]">{m.sender.name} · {m.isInternal?"Operations only":m.sender.role==="ADMIN"?"BookLeaf team":"Author"}</p></div><time dateTime={m.createdAt} className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-[#817b80]"><Clock3 size={13}/>{formatDate(m.createdAt)} · {formatTime(m.createdAt)}</time></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#5f595e]">{m.body}</p></div></div>)}{ticket.messages.length===0&&<p className="ml-11 rounded-xl border border-dashed border-[#e5cccc] bg-[#fffdfc] px-4 py-5 text-center text-sm text-[#817b80]">No follow-up activity yet.</p>}</div></div></CardContent></Card>
<Card className="xl:sticky xl:bottom-4 xl:z-20 xl:shadow-[0_14px_40px_rgba(63,32,38,.12)]"><CardHeader className="p-3 sm:p-4"><div className="flex items-center justify-between gap-3"><div><CardTitle className="text-base">AI response workspace</CardTitle><p className="mt-0.5 text-[11px] leading-4 text-[#746f75]">Draft from policy and author context.</p></div><Button size="sm" variant="secondary" onClick={event=>requireAssignment(()=>void generate(),event.currentTarget)} disabled={busy==="ai"}><Bot size={15}/>{busy==="ai"?"Drafting…":"Generate draft"}</Button></div></CardHeader><CardContent className="px-3 pb-3 sm:px-4 sm:pb-4"><Textarea value={draft} onChange={e=>setDraft(e.target.value)} rows={3} className="min-h-20 max-h-32 resize-y px-3 py-2.5 leading-5" placeholder="Generate a draft or write the response manually."/><div className="mt-2 flex items-center justify-between gap-3"><p className="text-[11px] text-[#8a8388]">Review before sending.</p><Button size="sm" onClick={sendResponse} disabled={busy==="send"}><Send size={14}/>{busy==="send"?"Sending…":"Send response"}</Button></div></CardContent></Card></div>
<aside className="space-y-6"><Card><CardHeader><CardTitle>Triage</CardTitle></CardHeader><CardContent className="space-y-5"><label className="block text-sm font-semibold">Status<Select value={ticket.status} onChange={e=>requireAssignment(()=>void update({status:e.target.value}))} className="mt-2">{statuses.map(v=><option key={v} value={v}>{labels[v]}</option>)}</Select></label><label className="block text-sm font-semibold">Priority<Select value={ticket.priority} onChange={e=>requireAssignment(()=>void update({priority:e.target.value}))} className="mt-2">{priorities.map(v=><option key={v} value={v}>{labels[v]}</option>)}</Select></label><label className="block text-sm font-semibold">Category<Select value={ticket.category} onChange={e=>requireAssignment(()=>void update({category:e.target.value}))} className="mt-2">{categories.map(v=><option key={v} value={v}>{labels[v]}</option>)}</Select></label><div className="rounded-xl bg-[#fff0ed] p-4 text-xs leading-5 text-[#8d3c49]"><Bot className="mr-1 inline size-4"/>AI suggested {labels[ticket.aiCategory]} at {labels[ticket.aiPriority]} priority ({Math.round((ticket.aiConfidence??.7)*100)}% confidence). Admin overrides are preserved.</div></CardContent></Card>
<Card><CardHeader><CardTitle>Internal note</CardTitle></CardHeader><CardContent><Textarea value={internal} onChange={e=>setInternal(e.target.value)} rows={5} placeholder="Visible only to the operations team."/><Button variant="outline" className="mt-3 w-full" onClick={addInternalNote} disabled={busy==="note"}><MessageSquareText size={16}/>Add private note</Button></CardContent></Card><Card><CardHeader><CardTitle>Author</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><p className="font-semibold">{ticket.author.name}</p><p className="text-[#746f75]">{ticket.author.email}</p><p className="text-[#746f75]">{ticket.author.phone??"No phone"}</p><p className="text-[#746f75]">{ticket.author.city??"City unavailable"}</p></CardContent></Card></aside></div></>}

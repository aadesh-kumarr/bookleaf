import { AdminQueue } from "@/components/admin-queue";
export default async function AdminPage({searchParams}:{searchParams:Promise<{status?:string;priority?:string}>}){const filters=await searchParams;const key=`${filters.status??""}-${filters.priority??""}`;return <AdminQueue key={key} initialStatus={filters.status} initialPriority={filters.priority}/>;}

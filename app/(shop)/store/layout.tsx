import { ToastProvider } from "@/app/components/Toast"
export default function StoreLayout({
  children,
  modal, 
}: {
  children: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
    <ToastProvider>
      {children}
      {modal}
      </ToastProvider>
    </>
  )
}
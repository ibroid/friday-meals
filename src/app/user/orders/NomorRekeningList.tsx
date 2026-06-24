import { prisma } from "@/lib/prisma"

export default async function NomorRekeningList() {

    const norek = await prisma.bankAccount.findMany({
        where: {
            isActive: true
        }
    })

    if (norek.length < 1) {
        return <p className="mt-2">Belum ada nomor rekening yang tersedia. Silahkan hubungi admin melalui whatsapp</p>
    }

    return (
        <div>
            <p className="mt-2">Transfer Ke :</p>
            <ol>
                {norek.map(n => <li key={n.id}><p>{n.accountNumber} {n.bankName} a.n {n.accountHolder}</p></li>)}
            </ol>
        </div>
    )
}
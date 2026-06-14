"use client";

import { useState } from "react";
import { BankAccount } from "@prisma/client";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const bankAccountSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountNumber: z.string().min(5, "Account number is required"),
  accountHolder: z.string().min(2, "Account holder is required"),
});

type FormData = z.infer<typeof bankAccountSchema>;

export default function BankAccountList({ initialBankAccounts }: { initialBankAccounts: BankAccount[] }) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bankName: "",
      accountNumber: "",
      accountHolder: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const url = editingId ? `/api/bank-accounts/${editingId}` : "/api/bank-accounts";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to save bank account");

      const result = await res.json();
      
      if (editingId) {
        setBankAccounts(bankAccounts.map((b) => (b.id === editingId ? result.bankAccount : b)));
      } else {
        setBankAccounts([result.bankAccount, ...bankAccounts]);
      }

      setIsOpen(false);
      form.reset();
      setEditingId(null);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (bankAccount: BankAccount) => {
    setEditingId(bankAccount.id);
    form.reset({
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      accountHolder: bankAccount.accountHolder,
    });
    setIsOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this bank account?")) return;

    try {
      const res = await fetch(`/api/bank-accounts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete bank account");

      setBankAccounts(bankAccounts.filter((b) => b.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to delete bank account");
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      form.reset({ bankName: "", accountNumber: "", accountHolder: "" });
      setEditingId(null);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm">
      <div className="p-4 flex justify-between items-center border-b">
        <h2 className="font-semibold">Daftar Rekening</h2>
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger className="inline-flex shrink-0 items-center justify-center rounded-md text-sm font-medium transition-[color,box-shadow] focus-visible:outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 ring-ring/10 dark:ring-ring/20 dark:outline-ring/40 outline-ring/50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" /> Tambah Rekening
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Rekening" : "Tambah Rekening Baru"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="bankName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Bank</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: BCA, Mandiri, BNI" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nomor Rekening</FormLabel>
                      <FormControl>
                        <Input placeholder="1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="accountHolder"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Atas Nama (Pemilik Rekening)</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingId ? "Simpan Perubahan" : "Tambahkan"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Bank</TableHead>
              <TableHead>Nomor Rekening</TableHead>
              <TableHead>Atas Nama</TableHead>
              <TableHead className="w-[100px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bankAccounts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  Belum ada rekening bank yang ditambahkan.
                </TableCell>
              </TableRow>
            ) : (
              bankAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-medium">{account.bankName}</TableCell>
                  <TableCell>{account.accountNumber}</TableCell>
                  <TableCell>{account.accountHolder}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(account)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

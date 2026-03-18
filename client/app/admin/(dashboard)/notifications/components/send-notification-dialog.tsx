"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/dialog";
import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { Textarea } from "@/components/textarea";
import { MultiSelect } from "@/components/multi-select";
import { User, Send } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/form";

type FlatRecipientType = {
  flatRecipientId: string;
  flatId: string;
  ownerId: string;
  isCurrentOwner: boolean;
  ownerName: string;
  ownerEmail: string;
  flat: string;
};

interface SendNotificationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (
    title: string,
    content: string,
    recipientIds: string[],
  ) => Promise<void>;
  recipients: FlatRecipientType[];
  loading?: boolean;
}

const formSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must not exceed 100 characters"),
  content: z
    .string()
    .min(5, "Content must be at least 5 characters")
    .max(500, "Content must not exceed 500 characters"),
  recipientIds: z
    .array(z.string())
    .min(1, "Please select at least one recipient"),
});

type FormValues = z.infer<typeof formSchema>;

export const SendNotificationDialog = ({
  isOpen,
  onClose,
  onSend,
  recipients,
  loading = false,
}: SendNotificationDialogProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      recipientIds: [],
    },
  });

  const onSubmit = async (data: FormValues) => {
    await onSend(data.title, data.content, data.recipientIds);
    form.reset();
  };

  const handleClose = () => {
    if (!loading) {
      form.reset();
      onClose();
    }
  };

  const recipientOptions = recipients.map((recipient) => ({
    label: `${recipient.ownerName} (${recipient.flat})`,
    value: recipient.flatRecipientId,
    icon: User,
    style: recipient.isCurrentOwner
      ? {
          badgeColor: "hsl(var(--primary) / 0.1)",
          iconColor: "hsl(var(--primary))",
        }
      : undefined,
  }));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Send Notification</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Maintenance Notice"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Type your notification message here..."
                      className="min-h-25"
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recipientIds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recipients</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={recipientOptions}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="border-2 border-muted"
                      placeholder="Select residents..."
                      maxCount={3}
                      variant="default"
                      disabled={loading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:justify-end">
              <Button
                size={"lg"}
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button size={"lg"} type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

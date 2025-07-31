import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Lock, Loader2, MessageCirclePlusIcon } from "lucide-react";

const createTweetSchema = z.object({
  text: z
    .string()
    .min(1, "Tweet cannot be empty")
    .max(280, "Tweet cannot exceed 280 characters"),
  isPrivate: z.boolean(),
});

type CreateTweetForm = z.infer<typeof createTweetSchema>;

interface CreateTweetDialogProps {
  onTweetCreated?: () => void;
}

export default function CreateTweetDialog({
  onTweetCreated,
}: CreateTweetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreateTweetForm>({
    resolver: zodResolver(createTweetSchema),
    defaultValues: {
      text: "",
      isPrivate: false,
    },
  });

  const isPrivate = watch("isPrivate");
  const text = watch("text");

  const onSubmit = async (data: CreateTweetForm) => {
    try {
      setIsSubmitting(true);
      await api.post(endpoints.createTweet, {
        text: data.text,
        isPrivate: data.isPrivate.toString(),
      });

      reset();
      setOpen(false);
      onTweetCreated?.();
    } catch (error) {
      console.error("Failed to create tweet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && !isSubmitting) {
      reset();
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="fixed bottom-6 right-6 h-10 w-10 rounded-full shadow-lg z-50"
        >
          <MessageCirclePlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Tweet</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Textarea
              {...register("text")}
              placeholder="What's happening?"
              rows={4}
              className="resize-none"
              disabled={isSubmitting}
            />
            {errors.text && (
              <p className="text-sm text-destructive">{errors.text.message}</p>
            )}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{text?.length || 0}/280</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Label
                htmlFor="privacy-toggle"
                className="flex items-center space-x-2"
              >
                {isPrivate ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Globe className="h-4 w-4" />
                )}
                <span>{isPrivate ? "Private" : "Public"}</span>
              </Label>
              <Switch
                id="privacy-toggle"
                checked={isPrivate}
                onCheckedChange={(checked) => setValue("isPrivate", checked)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !text?.trim()}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Tweet"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from "react";
import { useFetcher } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { userme } from "~/services/auth/userme.server";
import { cn } from "~/lib/utils";
import { getUserToken } from "~/services/auth/session.server";
import {
  addProfileRelationAction,
  removeProfileRelationAction,
} from "~/data/actions";

import { Button } from "~/components/ui/button";
import { CheckIcon } from "~/components/icons/CheckIcon";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await userme(request);
  if (!user) return null;

  const url = new URL(request.url);
  const documentId = url.searchParams.get("documentId");

  const lessons = user.userProfile?.completedLessons || [];

  const isCompleted = !!lessons.find(
    (lesson: { documentId: string }) => lesson.documentId === documentId
  );

  return json({ isCompleted });
}

export async function action({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const lessonId = url.searchParams.get("documentId");

  const user = await userme(request);
  const authToken = await getUserToken(request);

  const userProfileId = user?.userProfile?.documentId;
  if (!user || !userProfileId) return redirect("/auth/onboarding");

  const lessons = user.userProfile.completedLessons;

  const isCompleted = !!lessons.find(
    (lesson: { documentId: string }) => lesson.documentId === lessonId
  );

  if (isCompleted) {
    await removeProfileRelationAction(
      userProfileId,
      lessonId as string,
      "completedLessons",
      authToken
    );
  } else {
    await addProfileRelationAction(
      userProfileId,
      lessonId as string,
      "completedLessons",
      authToken
    );
  }

  return json({ isCompleted: !isCompleted });
}
export function LessonStatusIcon({ documentId }: { readonly documentId: string }) {
  const fetcher = useFetcher<typeof loader>();
  const isCompleted = fetcher.data?.isCompleted;

  useEffect(() => {
    fetcher.load(`/api/complete?documentId=${documentId}`);
  }, [documentId]);

  const color = isCompleted ? "text-muted-foreground" : "text-muted";

  return (
    <CheckIcon className={cn("w-7 h-7 bg-muted rounded-full p-1", color)} />
  );
}

export function LessonStatusButton({ documentId }: { readonly documentId: string }) {
  const fetcher = useFetcher<typeof action>();
  const isCompleted = fetcher.data?.isCompleted;


  useEffect(() => {
    fetcher.load(`/api/complete?documentId=${documentId}`);
  }, [documentId]);

  return (
    <fetcher.Form method="POST" action={`/api/complete?documentId=${documentId}`} className="z-50">
      <input
        hidden
        name="isCompleted"
        defaultValue={isCompleted ? "false" : "true"}
      />

      <Button
        variant="outline"
        className="w-full rounded-sm my-4"
        type="submit"
      >
        {isCompleted ? "Completed" : "Mark as completed"}
      </Button>
    </fetcher.Form>
  );
}

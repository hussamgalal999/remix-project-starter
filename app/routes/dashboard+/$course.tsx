import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Outlet, useParams } from "@remix-run/react";
import { cn } from "~/lib/utils";

import { getCourseBySlug } from "~/lib/fetch";

import { TooltipProvider } from "~/components/ui/tooltip";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "~/components/ui/resizable";

import { Separator } from "~/components/ui/separator";

export async function loader({ params }: LoaderFunctionArgs) {
  const { course } = params;
  const PUBLIC_TOKEN = process.env.READ_ONLY_STRAPI_API_TOKEN;
  const data = await getCourseBySlug(course as string, PUBLIC_TOKEN);
  const courseData = data?.data[0];
  return json({ data: courseData });
}

interface LessonListProps {
  documentId: string;
  slug: string;
  title: string;
  description: string;
}

export default function DashboardRoute() {
  const params = useParams();
  const { data } = useLoaderData<typeof loader>();

  const courseList = data.lessons;

  return (
    <TooltipProvider delayDuration={0}>
      <Separator />

      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={250}>
          <div className="p-2 h-[calc(100vh-72px)]">
            <div className="rounded p-4 overflow-auto">
              <h2 className="text-xl font-bold mb-4">Lessons</h2>
              <div className="space-y-2">
                {courseList.map((lesson: LessonListProps, index: number) => {
                  const isSelected = params.lesson === lesson.slug;
                  const { title, description, documentId, slug } = lesson;
                  return (
                    <Link
                      key={documentId}
                      to={slug}
                      className={cn(
                        "flex items-center justify-between bg-background rounded p-3 cursor-pointer hover:bg-muted transition-colors",
                        isSelected ? "bg-muted" : ""
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-none bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium">{title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {description}
                          </p>
                        </div>
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <CheckIcon className="w-5 h-5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          <Separator />
        </ResizablePanel>

        <ResizableHandle />
        <ResizablePanel defaultSize={655}>
          <Outlet />
        </ResizablePanel>
      </ResizablePanelGroup>
      <Separator />
    </TooltipProvider>
  );
}

function CheckIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

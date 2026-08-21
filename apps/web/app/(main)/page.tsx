import Link from "next/link";
import { Plus, Siren } from "lucide-react";
import { FeedList } from "@/components/feed/feed-list";
import { Button } from "@/components/ui/button";

/**
 * Home = the civic issue feed (per spec). Mobile-first: the page header is
 * compact on mobile; the desktop sidebar already exposes "Report an issue".
 */
export default function HomePage() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-dark sm:text-2xl">
            Community feed
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Live civic issues reported across Dhaka.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button asChild variant="destructive" size="sm">
            <Link href="/emergency">
              <Siren className="h-4 w-4" /> SOS
            </Link>
          </Button>
          <Button asChild size="sm" className="md:hidden">
            <Link href="/post/new">
              <Plus className="h-4 w-4" /> Report
            </Link>
          </Button>
        </div>
      </div>

      <FeedList />
    </div>
  );
}

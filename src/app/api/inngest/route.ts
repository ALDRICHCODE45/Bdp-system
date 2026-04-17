import { serve } from "inngest/next";

import { inngest } from "@/core/shared/inngest/inngest";
import { functions } from "@/core/shared/inngest/functions";

export const { GET, POST, PUT } = serve({ client: inngest, functions });

/* eslint-disable camelcase */
import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";
import { IncomingHttpHeaders } from "http";
import { NextResponse } from "next/server";
import {
    addMemberToCommunity,
    createCommunity,
    deleteCommunity,
    removeUserFromCommunity,
    updateCommunityInfo,
} from "@/lib/actions/community.actions";

type EventType =
    | "organization.created"
    | "organizationInvitation.created"
    | "organizationMembership.created"
    | "organizationMembership.deleted"
    | "organization.updated"
    | "organization.deleted";

interface OrganizationData {
    id: string;
    name: string;
    slug: string;
    logo_url?: string;
    image_url?: string;
    created_by: string;
}

interface MembershipData {
    organization: { id: string };
    public_user_data: { user_id: string };
}

interface Event {
    data: OrganizationData | MembershipData;
    object: "event";
    type: EventType;
}

export const POST = async (request: Request) => {
    const payload = await request.json();
    const header = headers();

    const heads = {
        "svix-id": header.get("svix-id"),
        "svix-timestamp": header.get("svix-timestamp"),
        "svix-signature": header.get("svix-signature"),
    };

    const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || "");

    let evnt: Event;

    try {
        evnt = wh.verify(
            JSON.stringify(payload),
            heads as IncomingHttpHeaders & WebhookRequiredHeaders
        ) as Event;
    } catch (err) {
        return NextResponse.json({ message: err }, { status: 400 });
    }

    if (!evnt?.type) {
        return NextResponse.json({ message: "Invalid event type" }, { status: 400 });
    }

    const eventType = evnt.type;

    try {
        switch (eventType) {
            case "organization.created": {
                const orgData = evnt.data as OrganizationData;
                const { id, name, slug, logo_url, image_url, created_by } = orgData;

                await createCommunity(
                    id,
                    name,
                    slug,
                    logo_url || image_url || "",
                    "org bio",
                    created_by
                );

                return NextResponse.json({ message: "Organization created" }, { status: 201 });
            }

            case "organizationMembership.created": {
                const memberData = evnt.data as MembershipData;
                const { organization, public_user_data } = memberData;

                if (!organization?.id || !public_user_data?.user_id) {
                    throw new Error("Missing required membership data");
                }

                await addMemberToCommunity(organization.id, public_user_data.user_id);

                return NextResponse.json({ message: "Member added" }, { status: 201 });
            }

            case "organizationMembership.deleted": {
                const memberData = evnt.data as MembershipData;
                const { organization, public_user_data } = memberData;

                if (!organization?.id || !public_user_data?.user_id) {
                    throw new Error("Missing required membership data");
                }

                await removeUserFromCommunity(public_user_data.user_id, organization.id);

                return NextResponse.json({ message: "Member removed" }, { status: 201 });
            }

            case "organization.updated": {
                const orgData = evnt.data as OrganizationData;
                const { id, logo_url, name, slug } = orgData;

                if (!id || !name || !slug) {
                    throw new Error("Missing required organization data");
                }

                await updateCommunityInfo(id, name, slug, logo_url || "");

                return NextResponse.json({ message: "Organization updated" }, { status: 201 });
            }

            case "organization.deleted": {
                const orgData = evnt.data as OrganizationData;
                const { id } = orgData;

                if (!id) {
                    throw new Error("Missing organization ID");
                }

                await deleteCommunity(id);

                return NextResponse.json({ message: "Organization deleted" }, { status: 201 });
            }

            case "organizationInvitation.created": {
                console.log("Invitation created", evnt.data);
                return NextResponse.json({ message: "Invitation created" }, { status: 201 });
            }

            default: {
                return NextResponse.json(
                    { message: "Unhandled event type" },
                    { status: 400 }
                );
            }
        }
    } catch (error) {
        console.error("Webhook error:", error);
        return NextResponse.json(
            { message: "Internal Server Error" },
            { status: 500 }
        );
    }
};
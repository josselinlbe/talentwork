import { ActionFunction, json } from "@remix-run/node";
import { RoleAssignedDto } from "~/application/dtos/events/RoleAssignedDto";

export const action: ActionFunction = async ({ request }) => {
  try {
    if (request.method === "POST") {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const body = (await request.json()) as RoleAssignedDto;
      // do something with the body 😉
      return json({ message: `${body.fromUser.email} assigned the '${body.role.name}' to ${body.role.name} 😊!` }, { status: 200 });
    }
  } catch (e: any) {
    return json({ error: e.message }, { status: 400 });
  }
};

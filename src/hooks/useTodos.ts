import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Todo } from "@/types";

// GET /todos/ — real endpoint, used by both the Todos page and the Calendar page
export function useTodos() {
  return useQuery<Todo[]>({
    queryKey: ["todos"],
    queryFn: async () => {
      const res = await api.get("/todos/");
      return res.data;
    },
  });
}
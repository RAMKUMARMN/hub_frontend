"use client";

import { useState } from "react";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";
import Select from "@/components/ui/Select";

export default function ComponentTestPage() {
  const [course, setCourse] = useState("CSE");

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Component Test Page
      </h1>

      <Card>
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input placeholder="Enter your email" />
          </div>

          <div>
            <Label>Course</Label>
            <Select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              options={["CSE", "ECE", "ME", "CE"]}
            />
          </div>

          <Button>
            Click Me
          </Button>
        </div>
      </Card>
    </div>
  );
}
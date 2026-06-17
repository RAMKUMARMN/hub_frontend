import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Label from "@/components/ui/Label";


export default function ComponentTestPage() {
  return (
    <div className="p-10 space-y-6">
      <h1 className="text-3xl font-bold">
        Component Test Page
      </h1>

      <Card>
        <Label>Email</Label>
        <Input placeholder="Enter your email" />
      </Card>

      <Button>
        Click Me
      </Button>

      
    </div>
  );
}
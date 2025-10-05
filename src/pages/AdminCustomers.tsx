import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, User, MapPin, Eye, ShoppingBag, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AdminCustomers() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedAddressId, setExpandedAddressId] = useState<string | null>(null);

  const allowedEmails = new Set<string>(["vidhigadgets@gmail.com"]);
  const isAuthorizedAdmin =
    !!isAuthenticated &&
    !!user &&
    (((user.role as string | undefined) === "admin") ||
      (user.email ? allowedEmails.has(user.email) : false));

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
    } else if (!isAuthorizedAdmin) {
      navigate("/");
    }
  }, [isAuthenticated, isAuthorizedAdmin, navigate]);

  const usersData = useQuery(api.users.getAllUsersWithActivity);

  if (!isAuthorizedAdmin) {
    return null;
  }

  const filteredUsers = usersData?.filter((userData) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      userData.email.toLowerCase().includes(searchLower) ||
      userData.name.toLowerCase().includes(searchLower) ||
      userData.mostInterestedCategory.toLowerCase().includes(searchLower) ||
      (userData.shippingAddress?.city || "").toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAddressShort = (address: any) => {
    if (!address) return "No address";
    const parts = [];
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.pin) parts.push(address.pin);
    return parts.length > 0 ? parts.join(", ") : "No address";
  };

  const formatAddressFull = (address: any): string[] => {
    if (!address) return ["No address on file"];
    const lines: string[] = [];
    
    // Line 1: Name
    if (address.firstName && address.lastName) {
      lines.push(`${address.firstName} ${address.lastName}`);
    } else if (address.name) {
      lines.push(address.name);
    }
    
    // Line 2: Street address
    if (address.address1) {
      lines.push(address.address1);
    } else if (address.address) {
      lines.push(address.address);
    }
    
    // Line 3: Apartment/Suite (if exists)
    if (address.address2) {
      lines.push(address.address2);
    }
    
    // Line 4: City, State, PIN
    const cityStateParts: string[] = [];
    if (address.city) cityStateParts.push(address.city);
    if (address.state) cityStateParts.push(address.state);
    if (address.pin) cityStateParts.push(address.pin);
    else if (address.postalCode) cityStateParts.push(address.postalCode);
    if (cityStateParts.length > 0) {
      lines.push(cityStateParts.join(", "));
    }
    
    // Line 5: Phone
    if (address.phone) {
      lines.push(`Phone: ${address.phone}`);
    }
    
    return lines.length > 0 ? lines : ["No address on file"];
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Analytics</h1>
          <p className="text-gray-600">
            Track customer behavior, delivery addresses, and product interests
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search Customers
            </CardTitle>
            <CardDescription>
              Search by email, name, category interest, or city
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Data</CardTitle>
            <CardDescription>
              {filteredUsers?.length || 0} customers found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!usersData ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading customer data...</p>
                </div>
              </div>
            ) : filteredUsers && filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No customers found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">Customer</TableHead>
                      <TableHead className="w-[100px]">Type</TableHead>
                      <TableHead className="w-[250px]">Delivery Address</TableHead>
                      <TableHead className="w-[150px]">Most Interested</TableHead>
                      <TableHead className="text-center w-[80px]">Orders</TableHead>
                      <TableHead className="w-[120px]">Last Active</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers?.map((userData) => (
                      <TableRow key={userData._id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {userData.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              {userData.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={userData.isAnonymous ? "secondary" : "default"}
                            className="whitespace-nowrap"
                          >
                            {userData.isAnonymous ? "Guest" : "Registered"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {userData.shippingAddress ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 truncate">
                                  {formatAddressShort(userData.shippingAddress)}
                                </p>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 mt-1"
                                  onClick={() => setExpandedAddressId(
                                    expandedAddressId === userData._id ? null : userData._id
                                  )}
                                >
                                  {expandedAddressId === userData._id ? (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      Hide
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                      View Full
                                    </>
                                  )}
                                </Button>
                                {expandedAddressId === userData._id && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                                    {formatAddressFull(userData.shippingAddress).map((line, idx) => (
                                      <p key={idx} className="text-sm text-gray-700">
                                        {line}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No address</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="font-medium capitalize text-sm">
                              {userData.mostInterestedCategory}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <ShoppingBag className="h-4 w-4 text-gray-400" />
                            <span className="font-semibold">
                              {userData.totalOrders}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {formatDate(userData.lastActive)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-between items-center">
          <button
            onClick={() => navigate("/admin")}
            className="text-sm text-gray-600 hover:text-gray-900 underline"
          >
            ← Back to Admin Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
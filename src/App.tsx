import React, { useState, useEffect } from "react";
import {
  Terminal,
  Settings,
  Cpu,
  ArrowRight,
  Code2,
  Database,
  FileJson,
  FileCode,
  Play,
  RotateCw,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Loader2,
  Zap,
  Braces,
  HelpCircle,
  Copy,
  Check,
  Lock,
  Eye,
  ShieldAlert,
  Key,
  BarChart3,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Activity,
  AlertCircle,
  RefreshCw,
  User,
  LogOut,
  Sliders,
  Send,
  Sparkles,
  Search,
  BookOpen
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from "recharts";

// Shared Prompt Log
const PROMPT_LOG_MD = `### Developer Prompt Log: Spring Boot XML/SOAP to REST/JSON Bridge with Spring Security
**Context**: Modernization of heritage banking systems using Spring Security 6.x and JAXB Marshalling.

\`\`\`markdown
Generate a high-performance, secure, and production-grade XML/SOAP to REST/JSON proxy translation service using Java 21, Spring Boot 3.x, and Spring Security 6.x:
1. Validate JSON requests via validation constraints (@Valid).
2. Use JAXB marshallers to build well-formed legacy SOAP Envelopes.
3. Configure a secure SecurityFilterChain bean protecting route limits with JWT verification.
4. Call legacy endpoints forwarding SOAPAction headers.
5. Setup a RestControllerAdvice converting legacy XML Fault elements to standard HTTP exception codes.
6. Persist log metrics to an H2/PostgreSQL transaction database.
\`\`\`
`;

// Default template seeds
const DEFAULT_WSDL_TEMPLATES = [
  {
    id: "payment-service",
    name: "Legacy Bank Payment Auth WSDL",
    description: "SOAP-based legacy bank transaction authorization with explicit currency types and account details.",
    wsdl: `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" 
                  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
                  xmlns:tns="http://legacy.pay.org/auth/" 
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                  targetNamespace="http://legacy.pay.org/auth/">
  <wsdl:types>
    <xsd:schema targetNamespace="http://legacy.pay.org/auth/">
      <xsd:element name="AuthorizePaymentRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="MerchantId" type="xsd:string"/>
            <xsd:element name="Amount" type="xsd:decimal"/>
            <xsd:element name="CurrencyCode" type="xsd:string"/>
            <xsd:element name="CardNumber" type="xsd:string"/>
            <xsd:element name="ExpiryDate" type="xsd:string"/>
            <xsd:element name="CVV" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="AuthorizePaymentResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="TransactionId" type="xsd:string"/>
            <xsd:element name="ResponseCode" type="xsd:string"/>
            <xsd:element name="Status" type="xsd:string"/>
            <xsd:element name="ApprovalCode" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>
  <wsdl:portType name="PaymentPort">
    <wsdl:operation name="AuthorizePayment">
      <wsdl:input message="tns:AuthorizePaymentRequest"/>
      <wsdl:output message="tns:AuthorizePaymentResponse"/>
    </wsdl:operation>
  </wsdl:portType>
  <wsdl:binding name="PaymentSoapBinding" type="tns:PaymentPort">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <wsdl:operation name="AuthorizePayment">
      <soap:operation soapAction="http://legacy.pay.org/auth/AuthorizePayment"/>
      <wsdl:input><soap:body use="literal"/></wsdl:input>
      <wsdl:output><soap:body use="literal"/></wsdl:output>
    </wsdl:operation>
  </wsdl:binding>
</wsdl:definitions>`
  },
  {
    id: "customer-service",
    name: "Legacy Customer Data SOAP Spec",
    description: "SOAP customer lookup and profiles access ledger hosted on historic core mainframe.",
    wsdl: `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" 
                  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" 
                  xmlns:tns="http://legacy.bank.org/userservice/" 
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                  targetNamespace="http://legacy.bank.org/userservice/">
  <wsdl:types>
    <xsd:schema targetNamespace="http://legacy.bank.org/userservice/">
      <xsd:element name="GetCustomerProfileRequest">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="CustomerId" type="xsd:string"/>
            <xsd:element name="UserEmail" type="xsd:string"/>
            <xsd:element name="FullName" type="xsd:string"/>
            <xsd:element name="AccountStatus" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </wsdl:types>
  <wsdl:portType name="CustomerPort">
    <wsdl:operation name="GetCustomerProfile">
      <wsdl:input message="tns:GetCustomerProfileRequest"/>
    </wsdl:operation>
  </wsdl:portType>
</wsdl:definitions>`
  }
];

export default function App() {
  // Navigation & General Tabs
  const [activeTab, setActiveTab] = useState<"dashboard" | "bridges" | "mapping" | "playground" | "keys" | "java">("dashboard");
  
  // Auth States
  const [user, setUser] = useState<any>(null);
  const [authEmail, setAuthEmail] = useState("developer@enterprise.org");
  const [authName, setAuthName] = useState("Enterprise Architect");
  const [authPassword, setAuthPassword] = useState("EnterprisePass123!");
  const [isAuthMode, setIsAuthMode] = useState<"login" | "register">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  // API Token State
  const [accessToken, setAccessToken] = useState("");

  // Notification Banner
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Bridges State
  const [bridges, setBridges] = useState<any[]>([]);
  const [selectedBridge, setSelectedBridge] = useState<any>(null);
  const [bridgesLoading, setBridgesLoading] = useState(false);
  
  // Create Bridge form
  const [newBridgeName, setNewBridgeName] = useState("Dynamic Payment Proxy");
  const [newBridgeDesc, setNewBridgeDesc] = useState("Real-time proxy modernisation transforming checkout events into financial SOAP transactions.");
  const [newWsdlContent, setNewWsdlContent] = useState(DEFAULT_WSDL_TEMPLATES[0].wsdl);
  const [newWsdlUrl, setNewWsdlUrl] = useState("");
  const [isCreatingBridge, setIsCreatingBridge] = useState(false);

  // Selected Operation Details (under Mapping)
  const [selectedOp, setSelectedOp] = useState<any>(null);
  const [isMappingAI, setIsMappingAI] = useState(false);
  
  // Playground Test
  const [playgroundPayload, setPlaygroundPayload] = useState('{\n  "merchantId": "MERCH_MOCK_ACTIVE",\n  "amount": 150.00,\n  "currencyCode": "USD",\n  "cardNumber": "4222333344445555",\n  "expiryDate": "11/29",\n  "cvv": "991"\n}');
  const [playgroundResult, setPlaygroundResult] = useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);
  const [playgroundApiKey, setPlaygroundApiKey] = useState("");
  const [isPayloadValidating, setIsPayloadValidating] = useState(false);
  const [payloadValidation, setPayloadValidation] = useState<any>(null);
  const [isSampleGenerating, setIsSampleGenerating] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [newKeyName, setNewKeyName] = useState("Core CRM integration");
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [generatedKeyVisible, setGeneratedKeyVisible] = useState("");

  // Analytics Overview states
  const [analyticsOverview, setAnalyticsOverview] = useState<any>({
    totalBridges: 0,
    activeEndpoints: 0,
    requestsToday: 0,
    errorRate: 0
  });
  const [analyticsTimeseries, setAnalyticsTimeseries] = useState<any[]>([]);
  const [analyticsByEndpoint, setAnalyticsByEndpoint] = useState<any[]>([]);
  const [requestLogs, setRequestLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [activeRange, setActiveRange] = useState("24h");

  // Code display selection for Java Tab
  const [codeFile, setCodeFile] = useState<string>("aiGateway");

  // Utilities helper
  const showToast = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("success", "Copied value to clipboard!");
  };

  /* =====================================================================================
   * NETWORK ACTIONS IMPLEMENTATION
   * =====================================================================================
   */
  
  // Auth Verification
  useEffect(() => {
    const checkCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        if (data.success && data.user) {
          setUser(data.user);
          setAccessToken(data.token || "session-active-cookie");
        }
      } catch (e) {
        // Not logged in
      }
    };
    checkCurrentUser();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");
    
    const path = isAuthMode === "register" ? "/api/auth/register" : "/api/auth/login";
    const body = isAuthMode === "register" 
      ? { name: authName, email: authEmail, password: authPassword } 
      : { email: authEmail, password: authPassword };

    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setAccessToken(data.token);
        showToast("success", `Successfully authorized session as ${data.user.name}`);
        fetchBridges();
        fetchAnalytics();
        fetchApiKeys();
      } else {
        setAuthError(data.error?.message || "Authentication credentials verification failed.");
      }
    } catch (err: any) {
      setAuthError("Failed reaching security mainframe: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setAccessToken("");
      showToast("success", "Session invalidated and signed out clean.");
    } catch (e) {}
  };

  // Fetch Bridges
  const fetchBridges = async () => {
    if (!user) return;
    setBridgesLoading(true);
    try {
      const resp = await fetch("/api/bridges", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success) {
        setBridges(data.bridges);
        // Automatically select the first bridge if none chosen
        if (data.bridges.length > 0 && !selectedBridge) {
          setSelectedBridge(data.bridges[0]);
          if (data.bridges[0].operations?.length > 0) {
            setSelectedOp(data.bridges[0].operations[0]);
          }
        }
      }
    } catch (e) {
      showToast("error", "Failed fetching registered bridges.");
    } finally {
      setBridgesLoading(false);
    }
  };

  // Fetch Analytics & Logs
  const fetchAnalytics = async () => {
    if (!user) return;
    try {
      const headers = { "Authorization": `Bearer ${accessToken}` };
      
      const overviewResp = await fetch("/api/analytics/overview", { headers });
      const overviewData = await overviewResp.json();
      if (overviewData.success) setAnalyticsOverview(overviewData.overview);

      const tsResp = await fetch(`/api/analytics/timeseries?range=${activeRange}`, { headers });
      const tsData = await tsResp.json();
      if (tsData.success) setAnalyticsTimeseries(tsData.timeseries);

      const endpointResp = await fetch("/api/analytics/by-endpoint", { headers });
      const endpointData = await endpointResp.json();
      if (endpointData.success) setAnalyticsByEndpoint(endpointData.byEndpoint);

      setLogsLoading(true);
      const logsResp = await fetch("/api/logs?page=1&limit=20", { headers });
      const logsData = await logsResp.json();
      if (logsData.success) setRequestLogs(logsData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch API Keys
  const fetchApiKeys = async () => {
    if (!user) return;
    try {
      const resp = await fetch("/api/settings/api-keys", {
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success) {
        setApiKeys(data.apiKeys);
        if (data.apiKeys.length > 0 && !playgroundApiKey) {
          setPlaygroundApiKey(data.apiKeys[0].key);
        }
      }
    } catch (e) {}
  };

  // Trigger loading when core structures change or range filters apply
  useEffect(() => {
    if (user) {
      fetchBridges();
      fetchAnalytics();
      fetchApiKeys();
    }
  }, [user, activeRange]);

  // Create Bridge Action
  const handleCreateBridgeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBridgeName || !newWsdlContent) {
      showToast("error", "Please provide a valid XML WSDL config.");
      return;
    }

    setIsCreatingBridge(true);
    try {
      const resp = await fetch("/api/bridges", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: newBridgeName,
          description: newBridgeDesc,
          wsdlContent: newWsdlContent,
          wsdlUrl: newWsdlUrl || null
        })
      });
      const data = await resp.json();
      if (data.success) {
        showToast("success", `Bridge "${newBridgeName}" configured successfully with ${data.bridge.operations?.length} dynamic operations!`);
        setNewBridgeName("");
        setNewBridgeDesc("");
        // Refresh
        await fetchBridges();
        await fetchAnalytics();
        setSelectedBridge(data.bridge);
        if (data.bridge.operations?.length > 0) {
          setSelectedOp(data.bridge.operations[0]);
        }
        setActiveTab("mapping");
      } else {
        showToast("error", data.error?.message || "Syntax exception occurred compiling WSDL.");
      }
    } catch (err: any) {
      showToast("error", "Network execution failed: " + err.message);
    } finally {
      setIsCreatingBridge(false);
    }
  };

  // Delete Bridge
  const handleDeleteBridge = async (id: string) => {
    if (!window.confirm("Are you completely certain? Cascade deletion is irreversible.")) return;
    try {
      const resp = await fetch(`/api/bridges/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success) {
        showToast("success", "Bridge decommissioned and deleted successfully.");
        setSelectedBridge(null);
        setSelectedOp(null);
        fetchBridges();
        fetchAnalytics();
      }
    } catch (e) {
      showToast("error", "Failed decommissioning target bridge.");
    }
  };

  // Turn Bridges Status Toggle
  const handleToggleBridgeStatus = async (bridge: any) => {
    const targetStatus = bridge.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      const resp = await fetch(`/api/bridges/${bridge.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ status: targetStatus })
      });
      const data = await resp.json();
      if (data.success) {
        showToast("success", `Bridge is now successfully toggled to ${targetStatus}`);
        fetchBridges();
        fetchAnalytics();
      }
    } catch (e) {
      showToast("error", "Exception toggling operational state.");
    }
  };

  // AI Mappings Normalization
  const handleTriggerAIMapping = async () => {
    if (!selectedBridge || !selectedOp) return;
    setIsMappingAI(true);
    try {
      const resp = await fetch(`/api/bridges/${selectedBridge.id}/operations/${selectedOp.id}/map-fields`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success && data.mappings) {
        // Save verified results back to operational configuration
        const updateResp = await fetch(`/api/bridges/${selectedBridge.id}/operations/${selectedOp.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${accessToken}`
          },
          body: JSON.stringify({ fieldMappings: data.mappings })
        });
        const updateData = await updateResp.json();
        if (updateData.success) {
          showToast("success", `Google Gemini mapped ${data.mappings.length} parameters successfully with direct reasoning indices!`);
          fetchBridges();
        }
      }
    } catch (e) {
      showToast("error", "Dynamic AI Field modernization mapping execution failed.");
    } finally {
      setIsMappingAI(false);
    }
  };

  // AI JSON Validator Playground
  const handleExecuteValidator = async () => {
    if (!selectedBridge || !selectedOp) return;
    setIsPayloadValidating(true);
    setPayloadValidation(null);
    try {
      let bodyObj = {};
      try {
        bodyObj = JSON.parse(playgroundPayload);
      } catch {
        showToast("error", "Malformed REST Client JSON payload syntax.");
        setIsPayloadValidating(false);
        return;
      }

      const resp = await fetch(`/api/bridges/${selectedBridge.id}/operations/${selectedOp.id}/validate-payload`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ requestBody: bodyObj })
      });
      const data = await resp.json();
      if (data.success) {
        setPayloadValidation({
          valid: data.valid,
          errors: data.errors,
          suggestions: data.suggestions
        });
        if (data.valid) {
          showToast("success", "JSON request matches structural schema mapping expectations!");
        } else {
          showToast("error", "Mapping payload mismatches expected legacy fields.");
        }
      }
    } catch (e) {
      showToast("error", "AI Schema validation verification pipeline crashed.");
    } finally {
      setIsPayloadValidating(false);
    }
  };

  // AI sample mock generator
  const handleGenerateSamples = async () => {
    if (!selectedBridge || !selectedOp) return;
    setIsSampleGenerating(true);
    try {
      const resp = await fetch(`/api/bridges/${selectedBridge.id}/operations/${selectedOp.id}/generate-samples`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success && data.samples) {
        setPlaygroundPayload(JSON.stringify(data.samples.sampleRequest, null, 2));
        showToast("success", "Generated highly realistic JSON payloads matching configuration mappings.");
      }
    } catch (e) {
      showToast("error", "AI Sample generation engine failed.");
    } finally {
      setIsSampleGenerating(false);
    }
  };

  // Run dynamic REST to SOAP proxy call
  const handleExecutePlaygroundCall = async () => {
    if (!selectedBridge || !selectedOp) return;
    playgroundResult && setPlaygroundResult(null);
    playgroundLoading || setPlaygroundLoading(true);

    try {
      let bodyObj = {};
      try {
        bodyObj = JSON.parse(playgroundPayload);
      } catch {
        showToast("error", "Parsing payload failed. Check your JSON format.");
        setPlaygroundLoading(false);
        return;
      }

      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (selectedOp.authRequired) {
        if (playgroundApiKey) {
          headers["X-API-KEY"] = playgroundApiKey;
        } else {
          headers["Authorization"] = `Bearer ${accessToken}`;
        }
      }

      // Proxy path
      const pathUrl = `/p/${selectedBridge.id}${selectedOp.restPath}`;
      const startMs = Date.now();

      const resp = await fetch(pathUrl, {
        method: selectedOp.restMethod.toUpperCase(),
        headers,
        body: JSON.stringify(bodyObj)
      });
      
      const latencyMs = Date.now() - startMs;
      const data = await resp.json();

      setPlaygroundResult({
        statusCode: resp.status,
        latencyMs,
        response: data
      });

      if (resp.status === 200) {
        showToast("success", "Dynamic proxy call modernized downstream and completed successfully!");
      } else {
        showToast("error", `Legacy endpoint returned error code Fault: ${data.error?.message || "Failed"}`);
      }

      // Refresh Analytics state
      fetchAnalytics();
    } catch (err: any) {
      showToast("error", "Failed triggering runtime bridge connector: " + err.message);
    } finally {
      setPlaygroundLoading(false);
    }
  };

  // Create API keys settings
  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName) return;
    isCreatingKey || setIsCreatingKey(true);
    try {
      const resp = await fetch("/api/settings/api-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ name: newKeyName })
      });
      const data = await resp.json();
      if (data.success) {
        showToast("success", "API security credentials created successfully.");
        setGeneratedKeyVisible(data.rawKey);
        setNewKeyName("");
        fetchApiKeys();
      }
    } catch (e) {
      showToast("error", "Failed creating programmatic credentials keys.");
    } finally {
      setIsCreatingKey(false);
    }
  };

  // Revoke API Keys
  const handleRevokeApiKey = async (id: string) => {
    if (!window.confirm("Are you completely certain? Active systems using this security token will fail immediately.")) return;
    try {
      const resp = await fetch(`/api/settings/api-keys/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success) {
        showToast("success", "Programmatic authentication token revoked successfully.");
        fetchApiKeys();
      }
    } catch (e) {
      showToast("error", "Failed revoking credentials.");
    }
  };

  // Seed standard sandbox payload
  const handleSeedSandboxTemplate = async () => {
    try {
      const resp = await fetch("/api/seed-sandbox-wsdl", {
        method: "POST",
        headers: { "Authorization": `Bearer ${accessToken}` }
      });
      const data = await resp.json();
      if (data.success) {
        setNewWsdlContent(data.wsdl);
        setNewBridgeName("Dynamic Payment Proxy");
        setNewBridgeDesc("Automated payment checkout events unmarshalling recursively into financial SOAP transactions.");
        showToast("success", "Loaded enterprise sandbox test spec template! Ready to compile and modernization.");
      }
    } catch (e) {}
  };

  // Dynamic WSDL config selection sync
  const selectTemplateAndLoad = (id: string) => {
    const findT = DEFAULT_WSDL_TEMPLATES.find(t => t.id === id);
    if (findT) {
      setNewWsdlContent(findT.wsdl);
      setNewBridgeName(findT.id === "payment-service" ? "Dynamic Payment Proxy" : "Legacy CRM Ledger Connector");
      setNewBridgeDesc(findT.description);
    }
  };

  /* =====================================================================================
   * PREVIEW SOURCE VIEWS (ENTERPRISE SPRING CODES)
   * =====================================================================================
   */
  const LOGS_COUNT = requestLogs.length;

  const JAVA_CLASS_CODES: Record<string, string> = {
    pom: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>org.bank</groupId>
    <artifactId>soap-rest-bridge</artifactId>
    <version>1.0.0</version>
    <name>soap-rest-bridge</name>
    <description>Enterprise XML/SOAP to REST/JSON Secure Modernization Bridge</description>

    <properties>
        <java.version>21</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- JAXB SOAP Marshaller Services -->
        <dependency>
            <groupId>jakarta.xml.bind</groupId>
            <artifactId>jakarta.xml.bind-api</artifactId>
            <version>4.0.1</version>
        </dependency>
        <dependency>
            <groupId>com.sun.xml.bind</groupId>
            <artifactId>jaxb-impl</artifactId>
            <version>4.0.1</version>
            <scope>runtime</scope>
        </dependency>
    </dependencies>
</project>`,
    aiGateway: `package org.bank.gateway;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class AiSoapRestGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiSoapRestGatewayApplication.class, args);
    }
}`,
    controller: `package org.bank.bridge.controller;

import jakarta.validation.Valid;
import org.bank.bridge.dto.*;
import org.bank.bridge.service.SoapProxyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SoapBridgeController {
    private static final Logger log = LoggerFactory.getLogger(SoapBridgeController.class);
    private final SoapProxyService proxyService;

    public SoapBridgeController(SoapProxyService proxyService) {
        this.proxyService = proxyService;
    }

    @PostMapping("/payments/authorize")
    public ResponseEntity<PaymentResponseDTO> authorizePayment(@Valid @RequestBody AuthorizePaymentRequest request) {
        log.info("Processing secure REST Payment for Merchant: {}", request.merchantId());
        PaymentResponseDTO response = proxyService.callLegacyPaymentSoap(request);
        return ResponseEntity.ok(response);
    }
}`
  };

  /* =====================================================================================
   * RENDERING THE SPLENDID MODERN INTERFACE
   * =====================================================================================
   */
  if (!user) {
    // Authenticate Landing Stage
    return (
      <div id="auth-main-card" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-6 font-sans relative overflow-hidden">
        {/* Subtle decorative orb highlights */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10">
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="bg-emerald-500/10 text-emerald-400 p-3.5 rounded-xl border border-emerald-500/20 mb-3.5 shadow-inner">
              <Zap className="h-6 w-6 stroke-[2.5]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">SOAP-to-REST AI Bridge</h1>
            <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Enterprise runtime modernization: dynamic proxy, secure API keys, and real-time logs parsing.</p>
          </div>

          {authError && (
            <div className="bg-rose-500/10 border border-rose-500/25 text-rose-300 p-3 rounded-lg text-xs flex items-center gap-2 mb-6 animate-shake">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isAuthMode === "register" && (
              <div className="space-y-1.5 text-left">
                <label className="text-[11px] font-medium text-slate-400 font-mono tracking-wider">FULL NAME</label>
                <input
                  type="text"
                  required
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="e.g. Senior Architect"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-650 outline-none focus:border-slate-700 font-mono"
                />
              </div>
            )}

            <div className="space-y-1.5 text-left font-mono">
              <label className="text-[11px] font-medium text-slate-400 tracking-wider">EMAIL ADDRESS</label>
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="e.g. architect@bank.org"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-650 outline-none focus:border-slate-700"
              />
            </div>

            <div className="space-y-1.5 text-left font-mono">
              <div className="flex justify-between items-center text-[11px]">
                <label className="font-medium text-slate-400 tracking-wider">SECURITY PASSPHRASE</label>
              </div>
              <input
                type="password"
                required
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="•••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-100 placeholder:text-slate-650 outline-none focus:border-slate-700"
              />
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={authLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs py-3 rounded-lg flex items-center justify-center space-x-2 transition disabled:opacity-50 cursor-pointer shadow-lg mt-6"
            >
              {authLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" /> : <Play className="h-4 w-4" />}
              <span>{isAuthMode === "register" ? "Provision Account Access" : "Authenticate Mainframe Credentials"}</span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/60 text-center text-xs">
            <button
              onClick={() => {
                setIsAuthMode(isAuthMode === "login" ? "register" : "login");
                setAuthError("");
              }}
              className="text-slate-400 underline hover:text-emerald-400 font-mono transition"
            >
              {isAuthMode === "login" ? "Create modern developer account package" : "Return to active authorization portal"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Stage
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans relative">
      {/* Dynamic Toast System notifications */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl flex items-start gap-3.5 max-w-sm animate-slide-in">
          {notification.type === "success" ? (
            <div className="text-emerald-400 bg-emerald-500/10 p-1 rounded-full"><CheckCircle className="h-4 w-4 stroke-[2.5]" /></div>
          ) : (
            <div className="text-rose-450 bg-rose-500/10 p-1 rounded-full"><XCircle className="h-4 w-4" /></div>
          )}
          <div className="space-y-0.5 text-left text-xs">
            <p className="text-slate-200 font-bold">{notification.type === "success" ? "Operation Executed" : "Security Intercept Alert"}</p>
            <p className="text-slate-400 font-mono">{notification.message}</p>
          </div>
        </div>
      )}

      {/* HEADER BAR */}
      <header className="border-b border-slate-900 bg-slate-900/45 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-45 shrink-0">
        <div className="flex items-center space-x-3.5">
          <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/15">
            <Zap className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              SOAP to REST Bridge
              <span className="text-[10px] bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/25 font-mono">ACTIVE DIRECT ROUTING</span>
            </h1>
            <p className="text-[11px] text-slate-400">Spec-driven unmarshalling, dynamic schemas caching, and intelligent normalizer gateway.</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-1.5 rounded-lg border border-slate-850 text-xs">
            <User className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-300 font-mono">{user.name}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
          <button
            onClick={handleLogout}
            className="p-2 bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-800 transition cursor-pointer"
            title="Sign out of bridge gateway"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* SIDE BAR BUTTON NAVIGATION */}
        <aside className="w-full md:w-64 border-r border-slate-900 bg-slate-950 p-5 flex flex-col space-y-4 shrink-0">
          <div>
            <h2 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-3.5 font-mono text-left">Systems Core</h2>
            <div className="space-y-1.5">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`w-full p-2.5 rounded-lg border transition-all duration-155 flex items-center space-x-3 text-xs ${
                  activeTab === "dashboard"
                    ? "bg-slate-900 border-emerald-500/30 text-white font-bold"
                    : "bg-slate-900/30 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Activity className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Monitoring Console</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("bridges");
                  fetchBridges();
                }}
                className={`w-full p-2.5 rounded-lg border transition-all duration-155 flex items-center space-x-3 text-xs ${
                  activeTab === "bridges"
                    ? "bg-slate-900 border-emerald-500/30 text-white font-bold"
                    : "bg-slate-900/30 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sliders className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>WSDL Schemas Parser</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("mapping");
                  fetchBridges();
                }}
                className={`w-full p-2.5 rounded-lg border transition-all duration-155 flex items-center space-x-3 text-xs ${
                  activeTab === "mapping"
                    ? "bg-slate-900 border-emerald-500/30 text-white font-bold"
                    : "bg-slate-900/30 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Dynamic AI Normalizer</span>
              </button>

              <button
                onClick={() => {
                  setActiveTab("playground");
                  fetchBridges();
                }}
                className={`w-full p-2.5 rounded-lg border transition-all duration-155 flex items-center space-x-3 text-xs ${
                  activeTab === "playground"
                    ? "bg-slate-900 border-emerald-500/30 text-white font-bold"
                    : "bg-slate-900/30 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Send className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Sandbox Playground</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-900">
            <h2 className="text-[10.5px] font-bold text-slate-500 uppercase tracking-widest mb-3.5 font-mono text-left">Credentials & Exports</h2>
            <div className="space-y-1.5 font-mono">
              <button
                onClick={() => {
                  setActiveTab("keys");
                  fetchApiKeys();
                }}
                className={`w-full p-2.5 rounded-lg border transition-all duration-155 flex items-center space-x-3 text-xs ${
                  activeTab === "keys"
                    ? "bg-slate-900 border-emerald-500/30 text-white font-bold"
                    : "bg-slate-900/30 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Key className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Modern API Keys</span>
              </button>

              <button
                onClick={() => setActiveTab("java")}
                className={`w-full p-2.5 rounded-lg border transition-all duration-155 flex items-center space-x-3 text-xs ${
                  activeTab === "java"
                    ? "bg-slate-900 border-emerald-500/30 text-white font-bold"
                    : "bg-slate-900/30 border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileCode className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>Java Source Code</span>
              </button>
            </div>
          </div>

          {/* Prompt Log card helper */}
          <div className="flex-1 flex flex-col justify-end text-left">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-900 space-y-2.5">
              <div className="flex items-center space-x-2 text-slate-200 font-mono font-bold text-xs">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Enterprise Core specs</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                Dynamic pipeline operates by mapping client REST endpoints recursively into JAXB styled XML structures, invoking mock services on standard port 3000, and stripping namespace elements dynamically.
              </p>
              <button
                onClick={() => handleCopy(PROMPT_LOG_MD)}
                className="w-full text-center bg-slate-950 border border-slate-850 hover:bg-slate-900 transition-all text-[10px] py-2 font-mono text-slate-350 rounded flex items-center justify-center gap-1.5 hover:text-white"
              >
                <Copy className="h-3 w-3" /> Copy Prompt specs
              </button>
            </div>
          </div>
        </aside>

        {/* DETAILS CORE WORKSPACE */}
        <main className="flex-1 p-6 overflow-y-auto space-y-6 text-left">
          
          {/* TAB 1: OPERATIONAL MONITORING CONSOLE */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 animate-fade-in">
              
              {/* TOP CARDS COUNTER ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-5 rounded-xl border border-slate-850 shadow-inner space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Bridges Configured</div>
                  <div className="text-2xl font-bold font-mono text-white">{analyticsOverview.totalBridges}</div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-850 shadow-inner space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Active Endpoints</div>
                  <div className="text-2xl font-bold font-mono text-emerald-400">{analyticsOverview.activeEndpoints}</div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-850 shadow-inner space-y-1">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Total API Requests (Today)</div>
                  <div className="text-2xl font-bold font-mono text-blue-400">{analyticsOverview.requestsToday}</div>
                </div>

                <div className="bg-slate-900 p-5 rounded-xl border border-slate-850 shadow-inner space-y-1 animate-pulse">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Dynamic Error Rate</div>
                  <div className="text-2xl font-bold font-mono text-rose-400">{analyticsOverview.errorRate}%</div>
                </div>
              </div>

              {/* CHART & HISTORIC TRACE GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* TIMERS SERIES TIMESERIES LINE CHART */}
                <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-850 p-5 flex flex-col h-[380px]">
                  <div className="flex justify-between items-center mb-4 shrink-0">
                    <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-350">Dynamic modernised events flow</span>
                    <div className="bg-slate-950 p-1 flex rounded-md border border-slate-800 text-[10px] font-mono">
                      {["24h", "7d", "30d"].map(r => (
                        <button
                          key={r}
                          onClick={() => setActiveRange(r)}
                          className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                            activeRange === r ? "bg-slate-900 text-emerald-400 font-bold" : "text-slate-550 hover:text-slate-300"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 w-full text-xs">
                    {analyticsTimeseries.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-500 font-mono">Awaiting core pipeline requests events logs...</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={analyticsTimeseries}>
                          <defs>
                            <linearGradient id="gradientRequests" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gradientErrors" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/>
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                          <XAxis dataKey="timestamp" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px", fontFamily: "monospace" }} />
                          <Area type="monotone" dataKey="count" name="Normalized REST calls" stroke="#10b981" fillOpacity={1} fill="url(#gradientRequests)" strokeWidth={2} />
                          <Area type="monotone" dataKey="errors" name="SOAP Fault exception redirects" stroke="#f43f5e" fillOpacity={1} fill="url(#gradientErrors)" strokeWidth={1.5} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* ENDPOINTS EVENT BAR DISTRIBUTION */}
                <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-850 p-5 flex flex-col h-[380px]">
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-350 mb-4 block text-left">Modern APIs load</span>
                  <div className="flex-1 w-full text-xs">
                    {analyticsByEndpoint.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-slate-550 font-mono text-center">No transactions mapped by endpoints yet.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsByEndpoint} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b"/>
                          <XAxis type="number" stroke="#64748b" />
                          <YAxis dataKey="operationName" type="category" stroke="#64748b" width={80} />
                          <Tooltip contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "8px" }} />
                          <Bar dataKey="count" name="Calls" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                            {analyticsByEndpoint.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#3b82f6"} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

              </div>

              {/* REAL-TIME AUDITING TRACE LOGS CONSOLE */}
              <div className="bg-slate-900 rounded-xl border border-slate-850 p-5 flex flex-col text-left">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850">
                  <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-350 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-emerald-400" /> Operational transaction auditing trace table
                  </span>
                  <button
                    onClick={fetchAnalytics}
                    className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs font-mono"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Refresh audit trace
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10.5px] text-slate-500 uppercase tracking-widest">
                        <th className="pb-3 text-left">Timestamp</th>
                        <th className="pb-3 text-left">Integration bridge</th>
                        <th className="pb-3 text-left">HTTP method</th>
                        <th className="pb-3 text-left">Proxy target path</th>
                        <th className="pb-3 text-left">Execution latency</th>
                        <th className="pb-3 text-left">HTTP status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850/40">
                      {logsLoading ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-400 mx-auto" />
                          </td>
                        </tr>
                      ) : LOGS_COUNT === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-6 text-center text-slate-500">No transactions recorded in secure SQLite audit database yet. Make some proxy requests!</td>
                        </tr>
                      ) : (
                        requestLogs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-950/20">
                            <td className="py-2.5 text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</td>
                            <td className="py-2.5 text-slate-200 font-sans font-semibold">{log.bridge?.name}</td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                                log.method === "POST" ? "bg-blue-500/10 text-blue-400" : "bg-amber-500/10 text-amber-400"
                              }`}>{log.method}</span>
                            </td>
                            <td className="py-2.5 text-slate-450">{log.path}</td>
                            <td className="py-2.5 text-slate-450 font-bold">{log.latencyMs}ms</td>
                            <td className="py-2.5">
                              <span className={`font-bold ${log.statusCode >= 400 ? "text-rose-450" : "text-emerald-400"}`}>
                                {log.statusCode}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: WSDL SCHEMAS PARSER ACTIONS */}
          {activeTab === "bridges" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              {/* SPLIT WSDL COMPILER INPUT PANEL VS RECORD MAP LIST */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* REGISTER NEW BRIDGE FORM */}
                <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-850 p-6 flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest font-mono">Modernise new Heritage service</h3>
                    <button
                      onClick={handleSeedSandboxTemplate}
                      className="bg-slate-950 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-800 text-[10px] text-emerald-400 font-mono transition flex items-center gap-1 cursor-pointer font-bold"
                    >
                      <Sparkles className="h-3 w-3" /> Load Sandbox Spec
                    </button>
                  </div>

                  <form onSubmit={handleCreateBridgeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 font-mono text-xs">
                        <label className="text-[10.5px] font-semibold text-slate-500 tracking-wider">BRIDGE SERVICE NAME</label>
                        <input
                          type="text"
                          required
                          value={newBridgeName}
                          onChange={(e) => setNewBridgeName(e.target.value)}
                          placeholder="e.g. Card Authorization portal"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-slate-700"
                        />
                      </div>

                      <div className="space-y-1.5 font-mono text-xs">
                        <label className="text-[10.5px] font-semibold text-slate-500 tracking-wider">WSDL DESCRIPTOR SPEC URL (OPTIONAL)</label>
                        <input
                          type="text"
                          value={newWsdlUrl}
                          onChange={(e) => setNewWsdlUrl(e.target.value)}
                          placeholder="http://banking.internal/ws/Authorize?wsdl"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-slate-700"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      <label className="text-[10.5px] font-semibold text-slate-500 tracking-wider">EXPLANATIONAL DESCRIPTION</label>
                      <input
                        type="text"
                        value={newBridgeDesc}
                        onChange={(e) => setNewBridgeDesc(e.target.value)}
                        placeholder="Modern endpoint proxies interface accessing secure traditional accounts services."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-slate-700"
                      />
                    </div>

                    {/* Quick Preset selection templates mapping */}
                    <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono pt-1">
                      <span>Presets:</span>
                      <button type="button" onClick={() => selectTemplateAndLoad("payment-service")} className="hover:text-emerald-400 underline">Payment Auth WSDL</button>
                      <span>|</span>
                      <button type="button" onClick={() => selectTemplateAndLoad("customer-service")} className="hover:text-emerald-400 underline">Customer data SOAP</button>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs flex-1 flex flex-col min-h-[220px]">
                      <label className="text-[10.5px] font-semibold text-slate-500 tracking-wider">HERITAGE XML WSDL CONTENT DEFINITION</label>
                      <textarea
                        required
                        value={newWsdlContent}
                        onChange={(e) => setNewWsdlContent(e.target.value)}
                        placeholder="Paste standard WSDL schema content here..."
                        className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10.5px] text-emerald-400 font-mono leading-relaxed resize-none outline-none focus:border-slate-700 h-[220px]"
                      />
                    </div>

                    <div className="flex justify-end pt-3">
                      <button
                        id="btn-bridge-create"
                        type="submit"
                        disabled={isCreatingBridge}
                        className="bg-emerald-600 hover:bg-emerald-500 font-semibold text-white px-5 py-2.5 rounded-lg text-xs flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer shadow-lg"
                      >
                        {isCreatingBridge ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" /> : <Play className="h-4.5 w-4.5" />}
                        <span>Compile & Registers Bridge endpoints</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* CURRENT ACTIVE BRIDGES REGISTERED */}
                <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-850 p-6 flex flex-col space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest font-mono text-left">Active modernised bridge points</h3>
                  
                  <div className="flex-1 overflow-y-auto space-y-3.5 max-h-[480px]">
                    {bridgesLoading ? (
                      <div className="py-12 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-400" /></div>
                    ) : bridges.length === 0 ? (
                      <div className="py-12 text-center text-slate-550 text-xs font-mono">No active integration bridges configured. Upload a WSDL above to trigger unmarshal configurations.</div>
                    ) : (
                      bridges.map(br => (
                        <div key={br.id} className="bg-slate-950 p-4 rounded-xl border border-slate-950 space-y-3 text-left">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                                <Sliders className="h-3.5 w-3.5 text-emerald-400" />
                                {br.name}
                              </h4>
                              <p className="text-[10px] text-slate-450 mt-1 line-clamp-2">{br.description}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleToggleBridgeStatus(br)}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-all cursor-pointer font-bold ${
                                  br.status === "ACTIVE"
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
                                    : "bg-slate-900 border-slate-800 text-slate-500"
                                }`}
                              >
                                {br.status}
                              </button>
                              <button
                                onClick={() => handleDeleteBridge(br.id)}
                                className="p-1 text-slate-500 hover:text-rose-400 rounded transition cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-500 border-t border-slate-900 pt-2.5">
                            <div>SOAP Endpoint: <span className="text-slate-350 truncate block mt-0.5">{br.soapEndpoint}</span></div>
                            <div>Namespace URI: <span className="text-slate-350 truncate block mt-0.5">{br.namespace}</span></div>
                          </div>

                          {br.operations && br.operations.length > 0 && (
                            <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono bg-slate-900/40 p-2 rounded">
                              <span className="text-slate-500">Configured REST Endpoints:</span>
                              <button
                                onClick={() => {
                                  setSelectedBridge(br);
                                  setSelectedOp(br.operations[0]);
                                  setActiveTab("mapping");
                                }}
                                className="text-emerald-400 font-bold hover:underline"
                              >
                                Manage {br.operations.length} path mappings &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: DYNAMIC AI FIELD NORMALIZING */}
          {activeTab === "mapping" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <Sparkles className="h-4.5 w-4.5 text-emerald-400" />
                    Intelligent dynamic mappings normalizer
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Select your active bridge integration mapping operation and invoke modern LLM parameters mapping.</p>
                </div>
              </div>

              {bridges.length === 0 ? (
                <div className="bg-slate-900 p-12 text-center rounded-xl border border-slate-850 font-mono text-xs text-slate-500">Configure an integration bridge with classic soap definitions before accessing AI mappings.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  
                  {/* SELECT BRIDGE OPERATIONS ACCORDION */}
                  <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-850 p-5 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">Selected bridge</label>
                      <select
                        value={selectedBridge?.id || ""}
                        onChange={(e) => {
                          const br = bridges.find(b => b.id === e.target.value);
                          if (br) {
                            setSelectedBridge(br);
                            setSelectedOp(br.operations?.length > 0 ? br.operations[0] : null);
                          }
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-white outline-none focus:border-slate-700"
                      >
                        {bridges.map(br => (
                          <option key={br.id} value={br.id}>{br.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block text-left">Endpoints definitions</span>
                      <div className="space-y-1.5 font-mono max-h-[340px] overflow-y-auto">
                        {selectedBridge?.operations?.map((op: any) => (
                          <button
                            key={op.id}
                            onClick={() => setSelectedOp(op)}
                            className={`w-full text-left p-2.5 rounded border transition-all text-[11px] flex items-center justify-between cursor-pointer ${
                              selectedOp?.id === op.id
                                ? "bg-slate-950 border-emerald-500/30 text-white font-bold"
                                : "bg-slate-950/40 border-transparent text-slate-450 hover:text-slate-350"
                            }`}
                          >
                            <span>{op.soapOperation}</span>
                            <span className="bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded text-[9px]">{op.restMethod}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* AI RESOLUTION PREVIEW SCREEN */}
                  <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-850 p-6 flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850 shrink-0">
                      <div>
                        <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-350 flex items-center gap-1.5">
                          <Braces className="h-4 w-4 text-emerald-400" /> Parameter map configurations: <code className="text-blue-450">{selectedOp?.restPath}</code>
                        </span>
                        <span className="text-[10.5px] font-mono text-slate-500 mt-0.5 block">{selectedOp?.soapAction}</span>
                      </div>
                      <button
                        onClick={handleTriggerAIMapping}
                        disabled={isMappingAI}
                        className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-xs font-semibold text-white transition disabled:opacity-50 cursor-pointer shadow-lg flex items-center gap-1.5 shrink-0"
                      >
                        {isMappingAI ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        <span>AI Normalise Fields</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                      {selectedOp && (
                        <div className="space-y-4">
                          {/* Mapped Fields List */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block text-left">Active Normalizations</span>
                            
                            <div className="space-y-2">
                              {JSON.parse(selectedOp.fieldMappings || "[]").map((mapping: any, i: number) => (
                                <div key={i} className="bg-slate-950 p-3.5 rounded-lg border border-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-left">
                                  <div className="flex items-center space-x-3 text-slate-200">
                                    <span className="text-[10.5px] font-bold text-slate-450 bg-slate-900 px-2 py-1 rounded border border-slate-850">{mapping.soapField}</span>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-650" />
                                    <span className="text-[10.5px] font-bold text-emerald-400">{mapping.restField}</span>
                                  </div>
                                  <div className="flex items-center space-x-3 text-[10.5px]">
                                    <span className="text-slate-500 max-w-[280px] font-sans truncate" title={mapping.reasoning}>{mapping.reasoning}</span>
                                    <span className={`px-2 py-0.5 rounded font-bold text-[9.5px] ${
                                      mapping.confidence >= 90 ? "bg-emerald-500/10 text-emerald-450" : "bg-amber-500/10 text-amber-400"
                                    }`}>{mapping.confidence}% Confidence</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Dual schemas JSON display view */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-left pt-2.5">
                            <div className="border border-slate-850 rounded bg-slate-950 p-3.5">
                              <span className="text-[10px] font-bold text-slate-500 border-b border-slate-900 pb-2 mb-2 block">Expected Request JSON schema</span>
                              <pre className="text-slate-350 leading-relaxed overflow-auto max-h-[140px] text-[10.5px]">
                                {JSON.stringify(JSON.parse(selectedOp.inputSchema), null, 2)}
                              </pre>
                            </div>

                            <div className="border border-slate-850 rounded bg-slate-950 p-3.5">
                              <span className="text-[10px] font-bold text-slate-500 border-b border-slate-900 pb-2 mb-2 block">Expected Response JSON schema</span>
                              <pre className="text-slate-350 leading-relaxed overflow-auto max-h-[140px] text-[10.5px]">
                                {JSON.stringify(JSON.parse(selectedOp.outputSchema), null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 4: SANDBOX INTERACTIVE PLAYGROUND */}
          {activeTab === "playground" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex justify-between items-center text-left">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-1.5 animate-pulse">
                    <Terminal className="h-4.5 w-4.5 text-emerald-400" />
                    Operational transaction sandbox validation
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Modernize requests in real time, watch Gemini validate schema parameters, review translated formats, and call custom mock SOAP servers.</p>
                </div>
              </div>

              {bridges.length === 0 ? (
                <div className="bg-slate-900 p-12 text-center rounded-xl border border-slate-850 font-mono text-xs text-slate-500">Configure an integration bridge with classic soap definitions before accessing playgrounds.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                  
                  {/* PLAYGROUND LEFT CONFIGS BLOCK */}
                  <div className="lg:col-span-5 flex flex-col space-y-4">
                    
                    {/* Sandbox active route headers info */}
                    <div className="bg-slate-900 rounded-xl border border-slate-850 p-4 space-y-3 text-xs text-left">
                      <div className="space-y-1 font-mono">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Active endpoint target</span>
                        <div className="flex gap-2 items-center text-[11px] bg-slate-950 p-2 border border-slate-850 rounded">
                          <span className="bg-blue-500/10 text-blue-400 font-bold px-1.5 py-0.5 rounded text-[9.5px] uppercase">{selectedOp?.restMethod}</span>
                          <span className="text-white truncate font-bold">{selectedOp?.restPath}</span>
                        </div>
                      </div>

                      {selectedOp?.authRequired && (
                        <div className="space-y-1 font-mono text-[11px]">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">X-API-KEY security credential header</span>
                          <select
                            value={playgroundApiKey}
                            onChange={(e) => setPlaygroundApiKey(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-slate-700"
                          >
                            <option value="">Use current Access session bearer token (Standard JWT)</option>
                            {apiKeys.map(k => (
                              <option key={k.id} value={k.key}>{k.name} ({k.key.substring(0, 8)}...)</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* REST client mockup text-area */}
                    <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden flex flex-col h-[360px] text-left">
                      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0 flex justify-between items-center bg-slate-905">
                        <span className="text-xs font-bold text-slate-300 font-mono">Incoming Client REST JSON</span>
                        <button
                          onClick={handleGenerateSamples}
                          disabled={isSampleGenerating}
                          className="text-[10.5px] text-emerald-400 font-mono hover:underline flex items-center gap-1 cursor-pointer font-bold"
                        >
                          {isSampleGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          <span>Generate Samples</span>
                        </button>
                      </div>

                      <div className="bg-slate-950 border-b border-slate-900 px-4 py-2 shrink-0 flex flex-wrap gap-2 items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 font-mono mr-1">Scenario Presets:</span>
                        <button
                          onClick={() => {
                            setPlaygroundPayload(JSON.stringify({
                              merchantId: "MERCH_ACTIVE_ENT",
                              amount: 150.00,
                              currencyCode: "USD",
                              cardNumber: "5105105105105105",
                              expiryDate: "12/30",
                              cvv: "321"
                            }, null, 2));
                            showToast("success", "Loaded Success Scenario Preset: Standard Credit Authorization.");
                          }}
                          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-emerald-400 font-mono text-[9.5px] px-2.5 py-1 rounded transition cursor-pointer"
                        >
                          Success Auth Request
                        </button>
                        <button
                          onClick={() => {
                            setPlaygroundPayload(JSON.stringify({
                              merchantId: "MERCH_ACTIVE_ENT",
                              amount: 5000.00,
                              currencyCode: "EUR",
                              cardNumber: "4000123456789012",
                              expiryDate: "05/28",
                              cvv: "443"
                            }, null, 2));
                            showToast("success", "Loaded Fault Scenario Preset: Insufficient Funds Exception.");
                          }}
                          className="bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-rose-400 font-mono text-[9.5px] px-2.5 py-1 rounded transition cursor-pointer"
                        >
                          Trigger SOAP Fault (402)
                        </button>
                      </div>

                      <textarea
                        value={playgroundPayload}
                        onChange={(e) => setPlaygroundPayload(e.target.value)}
                        className="flex-1 p-4 bg-slate-950 text-white font-mono text-xs leading-relaxed resize-none outline-none focus:bg-slate-960 border-0"
                      />

                      <div className="bg-slate-900/60 p-3 border-t border-slate-850 shrink-0 flex justify-end gap-2 text-xs font-semibold">
                        <button
                          onClick={handleExecuteValidator}
                          disabled={isPayloadValidating}
                          className="bg-slate-950 text-slate-350 border border-slate-800 hover:bg-slate-850 py-2 px-4 rounded text-xs transition cursor-pointer flex items-center gap-1.5"
                        >
                          {isPayloadValidating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 text-emerald-400" />}
                          <span>AI Validate request</span>
                        </button>

                        <button
                          onClick={handleExecutePlaygroundCall}
                          disabled={playgroundLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] px-5 py-2.5 rounded text-white transition disabled:opacity-50 cursor-pointer shadow-lg flex items-center gap-1.5 font-bold"
                        >
                          {playgroundLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" /> : <Play className="h-3.5 w-3.5" />}
                          <span>Execute proxy unmarshal</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* PLAYGROUND RIGHT DUAL TIMELINES AND TRACES RESULTS */}
                  <div className="lg:col-span-7 flex flex-col space-y-4 text-left">
                    
                    <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden flex flex-col h-[520px]">
                      <div className="bg-slate-905 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0">
                        <span className="text-xs font-bold text-slate-350 font-mono">Modernizer runtime unmarshal proxy tracing</span>
                        <span className="text-[10px] bg-slate-850 text-slate-300 px-2 py-0.5 rounded border border-slate-800 font-mono">GATEWAY TRACE</span>
                      </div>

                      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-xs leading-relaxed">
                        
                        {/* VALIDATION FEEDBACK BOX */}
                        {payloadValidation && (
                          <div className={`p-4 rounded-xl border flex gap-3 text-xs text-left ${
                            payloadValidation.valid 
                              ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-400" 
                              : "bg-amber-500/10 border-amber-500/25 text-amber-500"
                          }`}>
                            {payloadValidation.valid ? <CheckCircle className="h-5 w-5 stroke-[2.5]" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
                            <div className="space-y-1 font-sans">
                              <p className="font-bold text-slate-200">AI Schema validation output:</p>
                              {payloadValidation.errors.length > 0 && (
                                <ul className="list-disc list-inside text-[11px] font-mono text-slate-300 space-y-1">
                                  {payloadValidation.errors.map((e: any, idx: number) => <li key={idx}>{e}</li>)}
                                </ul>
                              )}
                              {payloadValidation.suggestions.length > 0 && (
                                <div className="text-[11.5px] text-slate-400 mt-1.5 font-sans">
                                  <strong>Gemini suggestions:</strong>
                                  <ul className="list-disc list-inside mt-1 font-mono text-slate-450 space-y-0.5">
                                    {payloadValidation.suggestions.map((s: any, idx: number) => <li key={idx}>{s}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {!playgroundResult ? (
                          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2.5">
                            <div className="h-10 w-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-450 text-md">?</div>
                            <div>
                              <p className="text-xs font-bold text-slate-300 animate-pulse">Awaiting Playground Execution</p>
                              <p className="text-[11px] text-slate-450 mt-1 max-w-[340px]">Formulate JSON inputs, test schemas dynamically, and execute requests to view transactional mappers XML output payload.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 text-left">
                            <div className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-900 font-sans">
                              <span>HTTP Status Code: <strong className={playgroundResult.statusCode >= 400 ? "text-rose-400" : "text-emerald-400"}>{playgroundResult.statusCode}</strong></span>
                              <span>Target upstream response latency: <strong>{playgroundResult.latencyMs}ms</strong></span>
                            </div>

                            <div className="border border-slate-850 rounded bg-slate-950 p-3.5 space-y-1.5">
                              <span className="text-[10px] font-bold text-slate-500 border-b border-slate-900 pb-1.5 mb-1.5 block font-sans">Returned JSON payload response</span>
                              <pre className="text-slate-200 overflow-auto max-h-[300px] leading-relaxed text-[11px] font-mono">
                                {JSON.stringify(playgroundResult.response, null, 2)}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* TAB 5: MANAGING API KEYS PROGRAMMATIC ACCESS */}
          {activeTab === "keys" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                
                {/* PROVIISON API KEY CARD */}
                <div className="lg:col-span-5 bg-slate-900 rounded-xl border border-slate-850 p-6 flex flex-col space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest font-mono">Provision Developer API Credentials</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">Generate secure programmatic authorization keys (`sb_...`). Programmatic systems can invoke modernized endpoints direct using authorization headers.</p>

                  <form onSubmit={handleCreateApiKey} className="space-y-4">
                    <div className="space-y-1.5 font-mono text-xs">
                      <label className="text-[10px] font-semibold text-slate-500 tracking-wider">CREDENTIALS NAME / LABEL</label>
                      <input
                        type="text"
                        required
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="e.g. CRM Service Client"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white outline-none focus:border-slate-700"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isCreatingKey}
                      className="bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.01] px-5 py-2.5 rounded text-xs text-white font-semibold transition disabled:opacity-50 cursor-pointer shadow-lg inline-flex items-center gap-1.5"
                    >
                      {isCreatingKey ? <Loader2 className="h-4 w-4 animate-spin text-slate-300" /> : <Plus className="h-4 w-4 stroke-[2.5]" />}
                      <span>Generate API key</span>
                    </button>
                  </form>

                  {generatedKeyVisible && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl space-y-2 animate-fade-in text-left">
                      <p className="text-xs font-bold leading-none font-sans">&#9888; Secret Key generated! Copy this value as it is shown only once:</p>
                      <div className="flex gap-2 items-center bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                        <input
                          type="text"
                          readOnly
                          value={generatedKeyVisible}
                          className="flex-1 bg-transparent text-[10.5px] text-emerald-400 font-mono font-bold outline-none border-0"
                        />
                        <button
                          onClick={() => handleCopy(generatedKeyVisible)}
                          className="text-slate-400 hover:text-white transition"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* API KEYS TABLE LEDGER */}
                <div className="lg:col-span-7 bg-slate-900 rounded-xl border border-slate-850 p-6 flex flex-col space-y-4">
                  <h3 className="text-sm font-bold tracking-tight text-white uppercase tracking-widest font-mono text-left">Security Access Keys Registry</h3>

                  <div className="overflow-x-auto select-none">
                    <table className="w-full text-xs font-mono text-slate-300 text-left">
                      <thead>
                        <tr className="border-b border-slate-800 text-[10px] text-slate-500 uppercase tracking-widest leading-none">
                          <th className="pb-3">Name Key</th>
                          <th className="pb-3">Masked token</th>
                          <th className="pb-3">Expires</th>
                          <th className="pb-3">Active status</th>
                          <th className="pb-3 text-right">Revoke action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/40">
                        {apiKeys.length === 0 ? (
                          <tr><td colSpan={5} className="py-6 text-center text-slate-550">No security access keys issued.</td></tr>
                        ) : (
                          apiKeys.map(k => (
                            <tr key={k.id} className="hover:bg-slate-950/10">
                              <td className="py-3 font-sans font-semibold text-slate-200">{k.name}</td>
                              <td className="py-3 text-slate-500">{k.key}</td>
                              <td className="py-3 text-slate-450">{new Date(k.createdAt).toLocaleDateString([], {month: "short", day: "numeric"})}</td>
                              <td className="py-3">
                                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded">ACTIVE</span>
                              </td>
                              <td className="py-3 text-right">
                                <button
                                  onClick={() => handleRevokeApiKey(k.id)}
                                  className="text-rose-450 hover:text-rose-300 font-sans transition pr-1.5"
                                >
                                  Revoke Key
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 6: JAVA EXPORTER SOURCE CODES PREVIEWS */}
          {activeTab === "java" && (
            <div className="space-y-6 animate-fade-in text-left">
              
              <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800 flex justify-between items-center text-left">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono flex items-center gap-1.5">
                    <FileCode className="h-4.5 w-4.5 text-emerald-400" />
                    Enterprise Java Spring Boot 3 / Security 6 exporter
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">Review, copy, or download the fully validated compiled Spring files configurations directly.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                
                {/* JAVA CONFIGS SELECTION ACCORDION */}
                <div className="lg:col-span-4 bg-slate-900 rounded-xl border border-slate-850 p-5 space-y-4">
                  <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Spring source blocks</span>
                  
                  <div className="space-y-1.5 font-mono text-xs">
                    <button
                      onClick={() => setCodeFile("aiGateway")}
                      className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between cursor-pointer ${
                        codeFile === "aiGateway" ? "bg-slate-950 border-emerald-500/30 text-white font-bold" : "bg-slate-950/40 border-transparent text-slate-450 hover:text-slate-350"
                      }`}
                    >
                      <span>AiSoapRestGatewayApplication.java</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/15">CORE</span>
                    </button>

                    <button
                      onClick={() => setCodeFile("controller")}
                      className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between cursor-pointer ${
                        codeFile === "controller" ? "bg-slate-950 border-emerald-500/30 text-white font-bold" : "bg-slate-950/40 border-transparent text-slate-450 hover:text-slate-350"
                      }`}
                    >
                      <span>SoapBridgeController.java</span>
                    </button>

                    <button
                      onClick={() => setCodeFile("pom")}
                      className={`w-full text-left p-2.5 rounded border transition-all flex items-center justify-between cursor-pointer ${
                        codeFile === "pom" ? "bg-slate-950 border-emerald-500/30 text-white font-bold" : "bg-slate-950/40 border-transparent text-slate-450 hover:text-slate-350"
                      }`}
                    >
                      <span>pom.xml (Mvn dependencies)</span>
                    </button>
                  </div>
                </div>

                {/* SHOWING CODES PREVIEWS */}
                <div className="lg:col-span-8 bg-slate-900 rounded-xl border border-slate-850 p-6 flex flex-col h-[520px]">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-850 shrink-0">
                    <span className="text-xs font-bold font-mono uppercase tracking-widest text-slate-200">{codeFile}.java spec source view</span>
                    <button
                      onClick={() => handleCopy(JAVA_CLASS_CODES[codeFile])}
                      className="text-xs text-slate-450 hover:text-white transition-all font-mono flex items-center gap-1 cursor-pointer hover:underline font-bold"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy Code block
                    </button>
                  </div>

                  <pre className="flex-1 overflow-auto text-emerald-400 text-[10.5px] font-mono bg-slate-950 p-4 rounded-xl leading-relaxed border border-slate-950">
                    {JAVA_CLASS_CODES[codeFile]}
                  </pre>
                </div>

              </div>

            </div>
          )}

        </main>

      </div>
    </div>
  );
}

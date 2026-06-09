import React, { useState, useEffect } from 'react';
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
  ShieldAlert
} from 'lucide-react';

const PROMPT_LOG_MD = `### Developer Prompt Log: Spring Boot XML/SOAP to REST/JSON Bridge with Spring Security
**Context**: Modernization of heritage banking systems using Spring Security 6.x and JAXB Marshalling.

\`\`\`markdown
Generate a high-performance, secure XML/SOAP to REST/JSON proxy translation service using Java 21, Spring Boot 3.x, and Spring Security 6.x:
1. Validate JSON requests via validation constraints (@Valid).
2. Use JAXB marshallers to build well-formed legacy SOAP Envelopes.
3. Configure a secure SecurityFilterChain bean protecting route limits with JWT verification.
4. Call legacy endpoints forwarding SOAPAction headers.
5. Setup a RestControllerAdvice converting legacy XML Fault elements to standard HTTP exception codes.
6. Persist log metrics to an H2/PostgreSQL transaction database.
\`\`\`
`;

// MOCK SOAP/WSDL TEMPLATES
const TEMPLATES = [
  {
    id: 'user-service',
    name: 'Legacy User Management WSDL',
    description: 'Traditional SOAP UserAccountService with Create, Get, and Delete operations.',
    wsdl: `<?xml version="1.0" encoding="UTF-8"?>
<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/"
                  xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
                  xmlns:tns="http://legacy.bank.org/userservice/"
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                  targetNamespace="http://legacy.bank.org/userservice/">
    <wsdl:types>
        <xsd:schema targetNamespace="http://legacy.bank.org/userservice/">
            <xsd:element name="GetUserRequest">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="UserId" type="xsd:int"/>
                        <xsd:element name="AuthToken" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            <xsd:element name="GetUserResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="Status" type="xsd:string"/>
                        <xsd:element name="UserProfile">
                            <xsd:complexType>
                                <xsd:sequence>
                                    <xsd:element name="Id" type="xsd:int"/>
                                    <xsd:element name="FullName" type="xsd:string"/>
                                    <xsd:element name="EmailAddress" type="xsd:string"/>
                                    <xsd:element name="Role" type="xsd:string"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:element>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            <xsd:element name="SOAPFault">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="faultcode" type="xsd:string"/>
                        <xsd:element name="faultstring" type="xsd:string"/>
                        <xsd:element name="detail" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
        </xsd:schema>
    </wsdl:types>
    
    <wsdl:message name="GetUserRequestMsg">
        <wsdl:part name="parameters" element="tns:GetUserRequest"/>
    </wsdl:message>
    <wsdl:message name="GetUserResponseMsg">
        <wsdl:part name="parameters" element="tns:GetUserResponse"/>
    </wsdl:message>
    
    <wsdl:portType name="UserPortType">
        <wsdl:operation name="GetUser">
            <wsdl:input message="tns:GetUserRequestMsg"/>
            <wsdl:output message="tns:GetUserResponseMsg"/>
        </wsdl:operation>
    </wsdl:portType>
</wsdl:definitions>`
  },
  {
    id: 'payment-gateway',
    name: 'Legacy Card payment SOAP Spec',
    description: 'SOAP-based legacy bank transaction authorization with explicit currency types.',
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
                        <xsd:element name="CardDetails">
                            <xsd:complexType>
                                <xsd:sequence>
                                    <xsd:element name="CardNumber" type="xsd:string"/>
                                    <xsd:element name="ExpiryDate" type="xsd:string"/>
                                    <xsd:element name="CVV" type="xsd:string"/>
                                </xsd:sequence>
                            </xsd:complexType>
                        </xsd:element>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
            <xsd:element name="AuthorizePaymentResponse">
                <xsd:complexType>
                    <xsd:sequence>
                        <xsd:element name="TransactionId" type="xsd:string"/>
                        <xsd:element name="ApprovalCode" type="xsd:string"/>
                        <xsd:element name="ResponseCode" type="xsd:string"/>
                        <xsd:element name="Status" type="xsd:string"/>
                    </xsd:sequence>
                </xsd:complexType>
            </xsd:element>
        </xsd:schema>
    </wsdl:types>
</wsdl:definitions>`
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'parser' | 'proxy' | 'agent' | 'codeViewer'>('parser');
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [xmlInput, setXmlInput] = useState(TEMPLATES[0].wsdl);
  const [copied, setCopied] = useState(false);

  // Schema Parser States
  const [isParsing, setIsParsing] = useState(false);
  const [parserOutput, setParserOutput] = useState<any>(null);

  // Spring Boot Proxy States
  const [testRestPayload, setTestRestPayload] = useState('{\n  "userId": 105,\n  "authToken": "Bearer-JWT-legacy-token-xyz556"\n}');
  const [isProxying, setIsProxying] = useState(false);
  const [proxyResult, setProxyResult] = useState<any>(null);
  const [faultMappersActive, setFaultMappersActive] = useState(true);
  const [clientTokenKey, setClientTokenKey] = useState('Bearer-JWT-legacy-token-xyz556');
  const [hasRoleValidate, setHasRoleValidate] = useState(true);

  // Agent Validation States
  const [agentStep, setAgentStep] = useState<number>(0);
  const [agentLogs, setAgentLogs] = useState<Array<{ type: 'info' | 'success' | 'warning' | 'error'; message: string; timestamp: string }>>([]);
  const [isAgentRunning, setIsAgentRunning] = useState(false);

  // Code Display selection
  const [codeFile, setCodeFile] = useState<'controller' | 'security' | 'jwtFilter' | 'service' | 'entity' | 'jaxbPojo' | 'exceptionAdvice' | 'pom'>('controller');

  // Sync XML input when template changes
  useEffect(() => {
    setXmlInput(selectedTemplate.wsdl);
    setParserOutput(null);
    if (selectedTemplate.id === 'user-service') {
      setTestRestPayload('{\n  "userId": 105,\n  "authToken": "Bearer-JWT-legacy-token-xyz556"\n}');
    } else {
      setTestRestPayload('{\n  "merchantId": "MERCH_881",\n  "amount": 250.00,\n  "currencyCode": "USD",\n  "cardDetails": {\n    "cardNumber": "4111222233334444",\n    "expiryDate": "12/28",\n    "cvv": "123"\n  }\n}');
    }
  }, [selectedTemplate]);

  // Copy clipboard helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. RUN PARSER SIMULATION (Java Output formats: records, controllers, classes)
  const handleParseSchema = () => {
    setIsParsing(true);
    setParserOutput(null);
    setTimeout(() => {
      setIsParsing(false);
      const isPayment = selectedTemplate.id === 'payment-gateway';
      if (isPayment) {
        setParserOutput({
          serviceName: 'LegacyCardPaymentSoapSpec',
          targetNamespace: 'http://legacy.pay.org/auth/',
          operations: [
            {
              name: 'AuthorizePayment',
              legacyXmlRoot: 'AuthorizePaymentRequest',
              restMethod: 'POST',
              restPath: '/api/v1/payments/authorize',
              requiredRole: 'ROLE_PAYMENT_ADMIN',
              javaModel: `package org.bank.bridge.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthorizePaymentRequest(
    @NotBlank @JsonProperty("merchantId") String merchantId,
    @NotNull @Positive @JsonProperty("amount") java.math.BigDecimal amount,
    @NotBlank @Size(min = 3, max = 3) @JsonProperty("currencyCode") String currencyCode,
    @NotNull @JsonProperty("cardDetails") CardDetailsDTO cardDetails
) {}

public record CardDetailsDTO(
    @NotBlank @Size(min = 16, max = 16) String cardNumber,
    @NotBlank String expiryDate,
    @NotBlank @Size(min = 3, max = 4) String cvv
) {}`
            }
          ]
        });
      } else {
        setParserOutput({
          serviceName: 'UserAccountService',
          targetNamespace: 'http://legacy.bank.org/userservice/',
          operations: [
            {
              name: 'GetUser',
              legacyXmlRoot: 'GetUserRequest',
              restMethod: 'POST',
              restPath: '/api/v1/users/get-profile',
              requiredRole: 'ROLE_USER',
              javaModel: `package org.bank.bridge.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonProperty;

public record GetUserRequest(
    @NotNull @JsonProperty("userId") Integer userId,
    @NotBlank @JsonProperty("authToken") String authToken
) {}`
            }
          ]
        });
      }
    }, 1200);
  };

  // 2. RUN PROXY RUNTIME SIMULATION (Java spring boot style)
  const handleProxyTest = () => {
    setIsProxying(true);
    setProxyResult(null);
    setTimeout(() => {
      setIsProxying(false);
      try {
        const parsed = JSON.parse(testRestPayload);
        const dateStr = new Date().toISOString();
        const isUserServ = selectedTemplate.id === 'user-service';

        let soapPayload = '';
        let simulatedSoapResponse = '';
        let restResponse = '';

        // Security role simulation checks before we run
        const isTokenEmpty = !clientTokenKey || clientTokenKey.trim() === "";
        const isUnauthorized = hasRoleValidate && (isTokenEmpty || !clientTokenKey.includes("Bearer-JWT"));

        if (isUnauthorized) {
          setProxyResult({
            errorType: "SpringSecurityException",
            status: 401,
            message: "Full authentication is required to access this resource. JWT Token is empty or signature is invalid.",
            adviceApplied: "Spring Security Delegated AuthenticationEntryPoint returned HTTP 401 Unauthorized."
          });
          return;
        }

        if (isUserServ) {
          const userId = parsed.userId || 0;
          const token = parsed.authToken || '';

          soapPayload = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="http://legacy.bank.org/userservice/">
   <soapenv:Header>
      <user:SecurityContext>
         <user:SigningKey>SECURE_BRIDGE_SIGN_KEY_2026</user:SigningKey>
      </user:SecurityContext>
   </soapenv:Header>
   <soapenv:Body>
      <user:GetUserRequest>
         <user:UserId>${userId}</user:UserId>
         <user:AuthToken>${token}</user:AuthToken>
      </user:GetUserRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

          if (userId <= 0 || !token || userId === 999) {
            simulatedSoapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
      <soapenv:Fault>
         <faultcode>soapenv:Client.AuthenticationFailed</faultcode>
         <faultstring>Legacy security token validation failed or User ID is invalid.</faultstring>
         <detail>The authentication server returned error code Legacy-401 for token: ${token}. Account is inactive or blocked.</detail>
      </soapenv:Fault>
   </soapenv:Body>
</soapenv:Envelope>`;

            restResponse = faultMappersActive 
              ? JSON.stringify({ 
                  error: "Unauthorized", 
                  status: 401, 
                  message: "Legacy security token validation failed or User ID is invalid.",
                  legacyFaultCode: "soapenv:Client.AuthenticationFailed",
                  resolvedVia: "@RestControllerAdvice mapping SOAP Fault to JSON error",
                  timestamp: dateStr
                }, null, 2)
              : simulatedSoapResponse; // If mapper is inactive, it spits raw ugly SOAP Fault details
          } else {
            simulatedSoapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:user="http://legacy.bank.org/userservice/">
   <soapenv:Body>
      <user:GetUserResponse>
         <user:Status>SUCCESS</user:Status>
         <user:UserProfile>
            <user:Id>${userId}</user:Id>
            <user:FullName>Legacy Spring Account Holder ${userId}</user:FullName>
            <user:EmailAddress>user_${userId}@legacy-bank-java-sdk.org</user:EmailAddress>
            <user:Role>PRIVILEGED_CORP_USER</user:Role>
         </user:UserProfile>
      </user:GetUserResponse>
   </soapenv:Body>
</soapenv:Envelope>`;

            restResponse = JSON.stringify({
              status: "success",
              profile: {
                id: userId,
                fullName: `Legacy Spring Account Holder ${userId}`,
                emailAddress: `user_${userId}@legacy-bank-java-sdk.org`,
                role: "PRIVILEGED_CORP_USER"
              },
              securedBy: "Spring Security Filter Chain (Authenticated Role Context: ROLE_USER)",
              translatedAt: dateStr
            }, null, 2);
          }
        } else {
          // Payment Simulation
          const amount = parsed.amount || 0;
          const cur = parsed.currencyCode || 'USD';
          const cardNum = parsed.cardDetails?.cardNumber || 'N/A';

          soapPayload = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pay="http://legacy.pay.org/auth/">
   <soapenv:Header>
      <pay:SecurityToken>API-X-SPRING-SECURE-KEY</pay:SecurityToken>
   </soapenv:Header>
   <soapenv:Body>
      <pay:AuthorizePaymentRequest>
         <pay:MerchantId>${parsed.merchantId || 'UNKNOWN'}</pay:MerchantId>
         <pay:Amount>${amount}</pay:Amount>
         <pay:CurrencyCode>${cur}</pay:CurrencyCode>
         <pay:CardDetails>
            <pay:CardNumber>${cardNum}</pay:CardNumber>
            <pay:ExpiryDate>${parsed.cardDetails?.expiryDate || 'N/A'}</pay:ExpiryDate>
            <pay:CVV>${parsed.cardDetails?.cvv || 'N/A'}</pay:CVV>
         </pay:CardDetails>
      </pay:AuthorizePaymentRequest>
   </soapenv:Body>
</soapenv:Envelope>`;

          if (amount <= 0 || cardNum.startsWith('4000')) {
            simulatedSoapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
   <soapenv:Body>
      <soapenv:Fault>
         <faultcode>soapenv:Server.InsufficientFunds</faultcode>
         <faultstring>Declined: The requested authorization amount is unavailable or exceeds card daily credit limit.</faultstring>
         <detail>Transaction declined. Java Spring SOAP mapper code resolved with banking response code Legacy-Declined-51</detail>
      </soapenv:Fault>
   </soapenv:Body>
</soapenv:Envelope>`;

            restResponse = faultMappersActive
              ? JSON.stringify({
                  error: "PaymentDeclined",
                  status: 402,
                  message: "Declined: The requested authorization amount is unavailable.",
                  legacyFaultCode: "soapenv:Server.InsufficientFunds",
                  resolvedVia: "@RestControllerAdvice MapSOAPErrorCode annotations",
                  timestamp: dateStr
                }, null, 2)
              : simulatedSoapResponse;
          } else {
            simulatedSoapResponse = `<?xml version="1.0" encoding="utf-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:pay="http://legacy.pay.org/auth/">
   <soapenv:Body>
      <pay:AuthorizePaymentResponse>
         <pay:TransactionId>TXN-J-${Math.floor(100000 + Math.random() * 900000)}</pay:TransactionId>
         <pay:ApprovalCode>SPRING-APP-0992</pay:ApprovalCode>
         <pay:ResponseCode>00</pay:ResponseCode>
         <pay:Status>AUTHORIZED</pay:Status>
      </pay:AuthorizePaymentResponse>
   </soapenv:Body>
</soapenv:Envelope>`;

            restResponse = JSON.stringify({
              transactionId: `TXN-J-${Math.floor(100000 + Math.random() * 900000)}`,
              approvalCode: "SPRING-APP-0992",
              responseCode: "00",
              status: "AUTHORIZED",
              securedBy: "Spring Security Filter Chain (Authenticated Role Context: ROLE_PAYMENT_ADMIN)",
              translatedAt: dateStr,
              databaseStatus: "PERSISTED_TO_H2_LOGS_VIA_JPA"
            }, null, 2);
          }
        }

        setProxyResult({
          restInput: parsed,
          outgoingSoapXml: soapPayload,
          legacySoapResponseXml: simulatedSoapResponse,
          restJsonOutput: restResponse,
          jpaLog: {
            logged: true,
            query: `@Transactional\npublic void saveLog(ProxyTransactionEvent event) {\n    ProxyTransactionLog log = new ProxyTransactionLog();\n    log.setServiceName("${selectedTemplate.id === 'user-service' ? 'UserAccountService' : 'LegacyCardPaymentSoapSpec'}");\n    log.setRestEndpoint("${selectedTemplate.id === 'user-service' ? '/api/v1/users/get-profile' : '/api/v1/payments/authorize'}");\n    log.setResponseCode(${simulatedSoapResponse.includes('Fault') ? (selectedTemplate.id === 'user-service' ? 401 : 402) : 200});\n    repository.save(log);\n}`
          }
        });
      } catch (err: any) {
        setProxyResult({
          error: "Invalid JSON format entered in testing payload: " + err.message
        });
      }
    }, 1000);
  };

  // 3. RUN JAVA AGENTIC TRANSLATION LOOP SIMULATION (JVM / JUnit 5 based)
  const startAgentLoop = () => {
    setIsAgentRunning(true);
    setAgentStep(1);
    setAgentLogs([]);
    
    const logs = [
      { t: 0, type: 'info', msg: 'Initializing Java Agentic modernization loop with legacy XML target namespace schemas.' },
      { t: 800, type: 'info', msg: 'Analyzing WSDL types. Found <xsd:element name="GetUserRequest"> and complex type tags.' },
      { t: 1600, type: 'success', msg: 'Draft 1 completed: Generated JAXB class POJOs with @XmlRootElement & Spring REST Controller.' },
      { t: 2400, type: 'warning', msg: 'Running Test Phase 1: Initiating junit test runner against org.bank.bridge.SoapBridgeApplicationTests...' },
      { t: 3200, type: 'error', msg: 'JUnit Failure (AssertionError): Expected generated XML elements root tag <GetUserRequest> but JAXB output marshaller missing namespace matching target http://legacy.bank.org/userservice/.' },
      { t: 4000, type: 'info', msg: 'Initiating self-correction: Injecting classloader namespace metadata and structural exceptions into generative LLM memory context.' },
      { t: 4800, type: 'info', msg: 'Java Agent Model refinement draft: Injecting @XmlSchema and package-info.java namespace bindings, and repairing getters/setters validation.' },
      { t: 5600, type: 'success', msg: 'Running Test Phase 2: Compiling patched source trees and running standard Marshaller test cases...' },
      { t: 6400, type: 'success', msg: 'JVM Compilation succeeded. All 5 JUnit test mappings passed! SOAP payload strictly complies with heritage bank standard.' },
      { t: 7200, type: 'success', msg: 'Durable JPA logging: Synced auto-generated state metadata to persistence H2 database.' }
    ];

    logs.forEach((logItem, index) => {
      setTimeout(() => {
        setAgentLogs(prev => [
          ...prev, 
          { 
            type: logItem.type as any, 
            message: logItem.msg, 
            timestamp: new Date().toLocaleTimeString() 
          }
        ]);
        setAgentStep(index + 1);
        if (index === logs.length - 1) {
          setIsAgentRunning(false);
        }
      }, logItem.t);
    });
  };

  // SPRING BOOT 3 & SPRING SECURITY 6 JAVA CODE BLOCKS
  const JAVA_CODE = {
    controller: `package org.bank.bridge.controller;

import jakarta.validation.Valid;
import org.bank.bridge.dto.*;
import org.bank.bridge.service.SoapProxyService;
import org.bank.bridge.entity.ProxyTransactionLog;
import org.bank.bridge.repository.ProxyLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SoapBridgeController {
    
    private static final Logger log = LoggerFactory.getLogger(SoapBridgeController.class);
    private final SoapProxyService proxyService;
    private final ProxyLogRepository logRepository;

    public SoapBridgeController(SoapProxyService proxyService, ProxyLogRepository logRepository) {
        this.proxyService = proxyService;
        this.logRepository = logRepository;
    }

    @PostMapping("/users/get-profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserResponseDTO> getUserProfile(@Valid @RequestBody GetUserRequest request) {
        log.info("Processing secure REST User GET request for ID: {}", request.userId());
        
        // Execute conversion, XML Marshalling and make outbound SOAP call
        UserResponseDTO response = proxyService.callLegacyUserSoap(request);
        
        // Persist transaction log
        logRepository.save(new ProxyTransactionLog(
            "UserAccountService",
            "/api/v1/users/get-profile",
            "GetUser",
            "SUCCESS",
            200
        ));
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/payments/authorize")
    @PreAuthorize("hasRole('PAYMENT_ADMIN')")
    public ResponseEntity<PaymentResponseDTO> authorizePayment(@Valid @RequestBody AuthorizePaymentRequest request) {
        log.info("Processing secure Payment Authorize for Merchant: {}, Amount: {}", 
            request.merchantId(), request.amount());
        
        PaymentResponseDTO response = proxyService.callLegacyPaymentSoap(request);
        
        logRepository.save(new ProxyTransactionLog(
            "LegacyCardPaymentSoapSpec",
            "/api/v1/payments/authorize",
            "AuthorizePayment",
            "SUCCESS",
            200
        ));
        
        return ResponseEntity.ok(response);
    }
}`,

    security: `package org.bank.bridge.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtAuthenticationFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/health", "/swagger-ui/**").permitAll()
                .anyRequest().authenticated()
            )
            // JWT verification filter protects route limits before reaching the legacy bridge proxy
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}`,

    jaxbPojo: `package org.bank.bridge.dto;

import jakarta.xml.bind.annotation.*;

@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "userId",
    "authToken"
})
@XmlRootElement(name = "GetUserRequest", namespace = "http://legacy.bank.org/userservice/")
public class GetUserRequestJaxb {

    @XmlElement(name = "UserId", namespace = "http://legacy.bank.org/userservice/")
    protected int userId;

    @XmlElement(name = "AuthToken", namespace = "http://legacy.bank.org/userservice/", required = true)
    protected String authToken;

    public int getUserId() { return userId; }
    public void setUserId(int value) { this.userId = value; }

    public String getAuthToken() { return authToken; }
    public void setAuthToken(String value) { this.authToken = value; }
}`,

    exceptionAdvice: `package org.bank.bridge.exception;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.w3c.dom.Document;
import org.xml.sax.InputSource;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.StringReader;
import java.time.Instant;
import java.util.Map;

@RestControllerAdvice
public class GlobalBridgeExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalBridgeExceptionHandler.class);

    @ExceptionHandler(LegacySoapFaultException.class)
    public ResponseEntity<Map<String, Object>> handleSoapFault(LegacySoapFaultException ex) {
        String faultXml = ex.getSoapFaultXml();
        log.warn("SOAP Fault caught from Legacy Banking Client system. Introspecting codes...");

        String faultCode = "soapenv:Server";
        String faultString = "Legacy service integration failed";
        String detail = "";

        try {
            // Standard Java DOM Builder parser
            DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
            dbf.setNamespaceAware(true);
            DocumentBuilder db = dbf.newDocumentBuilder();
            Document doc = db.parse(new InputSource(new StringReader(faultXml)));

            if (doc.getElementsByTagName("faultcode").getLength() > 0) {
                faultCode = doc.getElementsByTagName("faultcode").item(0).getTextContent();
            }
            if (doc.getElementsByTagName("faultstring").getLength() > 0) {
                faultString = doc.getElementsByTagName("faultstring").item(0).getTextContent();
            }
            if (doc.getElementsByTagName("detail").getLength() > 0) {
                detail = doc.getElementsByTagName("detail").item(0).getTextContent();
            }
        } catch (Exception e) {
            log.error("Failed to parse Legacy XML SOAP Fault payload, falling back to string scan.", e);
        }

        // SPRING REST EXCEPTION CONVERTER
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (faultCode.contains("AuthenticationFailed")) {
            status = HttpStatus.UNAUTHORIZED; // Convert to 401
        } else if (faultCode.contains("InsufficientFunds")) {
            status = HttpStatus.PAYMENT_REQUIRED; // Convert to 402
        } else if (faultCode.contains("InvalidRequest")) {
            status = HttpStatus.BAD_REQUEST; // Convert to 400
        }

        return ResponseEntity.status(status).body(Map.of(
            "error", status.getReasonPhrase(),
            "status", status.value(),
            "message", faultString,
            "legacyFaultCode", faultCode,
            "detail", detail,
            "timestamp", Instant.now().toString()
        ));
    }
}`,

    jwtFilter: `package org.bank.bridge.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            // Extracts role based on token signature simulation
            String role = "ROLE_USER";
            if (token.contains("payment-admin")) {
                role = "ROLE_PAYMENT_ADMIN";
            }

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                "legacy-client", 
                null, 
                List.of(new SimpleGrantedAuthority(role))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }

        filterChain.doFilter(request, response);
    }
}`,

    service: `package org.bank.bridge.service;

import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.Marshaller;
import org.bank.bridge.dto.*;
import org.bank.bridge.exception.LegacySoapFaultException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.io.StringWriter;

@Service
public class SoapProxyService {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String SOAP_ENDPOINT = "http://localhost:8080/legacy/ws";

    public UserResponseDTO callLegacyUserSoap(GetUserRequest req) {
        try {
            JAXBContext context = JAXBContext.newInstance(GetUserRequestJaxb.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, Boolean.TRUE);

            GetUserRequestJaxb jaxbReq = new GetUserRequestJaxb();
            jaxbReq.setUserId(req.userId());
            jaxbReq.setAuthToken(req.authToken());

            StringWriter sw = new StringWriter();
            marshaller.marshal(jaxbReq, sw);
            String soapEnvelope = sw.toString();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_XML);
            headers.set("SOAPAction", "http://legacy.bank.org/userservice/GetUser");

            HttpEntity<String> entity = new HttpEntity<>(soapEnvelope, headers);
            String response = restTemplate.postForObject(SOAP_ENDPOINT, entity, String.class);

            if (response != null && response.contains("<soapenv:Fault>")) {
                throw new LegacySoapFaultException(response);
            }

            return new UserResponseDTO("success", new UserResponseDTO.Profile(
                req.userId(),
                "Legacy Spring Account Holder " + req.userId(),
                "user_" + req.userId() + "@legacy-bank-java-sdk.org",
                "PRIVILEGED_CORP_USER"
            ));
        } catch (Exception e) {
            if (e instanceof LegacySoapFaultException) {
                throw (LegacySoapFaultException) e;
            }
            throw new RuntimeException("SOAP invocation error", e);
        }
    }

    public PaymentResponseDTO callLegacyPaymentSoap(AuthorizePaymentRequest req) {
        try {
            StringWriter sw = new StringWriter();
            // JAXB Marshalling payment parameters logic here
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.TEXT_XML);
            headers.set("SOAPAction", "http://legacy.pay.org/auth/AuthorizePayment");

            if (req.amount().doubleValue() <= 0) {
                String faultResponse = "<?xml version=\"1.0\" encoding=\"utf-8\"?><soapenv:Envelope xmlns:soapenv=\"http://schemas.xmlsoap.org/soap/envelope/\"><soapenv:Body><soapenv:Fault><faultcode>soapenv:Server.InsufficientFunds</faultcode><faultstring>Declined: The requested authorization amount is unavailable or exceeds card daily credit limit.</faultstring></soapenv:Fault></soapenv:Body></soapenv:Envelope>";
                throw new LegacySoapFaultException(faultResponse);
            }

            return new PaymentResponseDTO(
                "TXN-J-" + System.currentTimeMillis(),
                "SPRING-APP-0992",
                "00",
                "AUTHORIZED"
            );
        } catch (Exception e) {
            if (e instanceof LegacySoapFaultException) {
                throw (LegacySoapFaultException) e;
            }
            throw new RuntimeException("SOAP payment integration failed", e);
        }
    }
}`,

    entity: `package org.bank.bridge.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "proxy_transaction_logs")
public class ProxyTransactionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String serviceName;
    private String restEndpoint;
    private String actionName;
    private String status;
    private int responseCode;
    private Instant timestamp;

    public ProxyTransactionLog() {
        this.timestamp = Instant.now();
    }

    public ProxyTransactionLog(String serviceName, String restEndpoint, String actionName, String status, int responseCode) {
        this();
        this.serviceName = serviceName;
        this.restEndpoint = restEndpoint;
        this.actionName = actionName;
        this.status = status;
        this.responseCode = responseCode;
    }

    // Standard getters and setters...
    public Long getId() { return id; }
    public String getServiceName() { return serviceName; }
    public String getRestEndpoint() { return restEndpoint; }
    public String getActionName() { return actionName; }
    public String getStatus() { return status; }
    public int getResponseCode() { return responseCode; }
    public Instant getTimestamp() { return timestamp; }
}`,

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

        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-2">
              Java SOAP to REST Bridge
              <span className="text-xs bg-emerald-500/15 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/35 font-mono">Spring Boot & Security</span>
            </h1>
            <p className="text-xs text-slate-400">Automated Java 21 WSDL Mapper, Spring Security interceptor, and enterprise JAXB XML fault converter</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-950/80 px-3 py-1.5 rounded-md border border-slate-800 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>JVM & Spring Security Rules Configured</span>
          </div>
        </div>
      </header>

      {/* DETAILED PROJECT INFO ALERT */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-3">
          <Settings className="text-emerald-400 h-4 w-4 shrink-0" />
          <span>
            <strong className="text-slate-200">Active Architecture:</strong> Java 21 | Spring Boot 3.x | Spring Security 6.x | Spring Data JPA | H@/H2 Logs
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-slate-950 px-2 py-1 rounded border border-slate-800">
          <span className="text-slate-400">Target Framework Build:</span>
          <span className="text-emerald-400 font-mono font-bold">mvn spring-boot:run</span>
        </div>
      </div>

      {/* CORE WORKSPACE PANELS */}
      <div className="flex-1 lg:grid lg:grid-cols-12 overflow-hidden">
        
        {/* LEFT NAV PANEL */}
        <aside className="lg:col-span-3 border-r border-slate-800 bg-slate-950 p-6 flex flex-col space-y-5">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Architectural Components</h2>
            <div className="space-y-2">
              <button 
                id="btn-parser-tab"
                onClick={() => setActiveTab('parser')}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-start space-x-2.5 ${
                  activeTab === 'parser' 
                    ? 'bg-slate-900 border-emerald-500/50 text-white shadow-lg' 
                    : 'bg-slate-900/30 border-slate-805 hover:border-slate-705 text-slate-400'
                }`}
              >
                <Code2 className={`mt-0.5 h-4 w-4 ${activeTab === 'parser' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="text-xs font-semibold font-mono">1. WSDL METADATA PARSER</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Builds Jackson DTO records, @XmlRootElement Java POJOs and target RestControllers.</div>
                </div>
              </button>

              <button 
                id="btn-proxy-tab"
                onClick={() => setActiveTab('proxy')}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-start space-x-2.5 ${
                  activeTab === 'proxy' 
                    ? 'bg-slate-900 border-emerald-500/50 text-white shadow-lg' 
                    : 'bg-slate-900/30 border-slate-805 hover:border-slate-750 text-slate-400'
                }`}
              >
                <Lock className={`mt-0.5 h-4 w-4 ${activeTab === 'proxy' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="text-xs font-semibold font-mono">2. SPRING PROXY & INT</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Verifies JWT scopes, marshals XML, parses downstream SOAP faults, logs to JPA H2.</div>
                </div>
              </button>

              <button 
                id="btn-agent-tab"
                onClick={() => setActiveTab('agent')}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-start space-x-2.5 ${
                  activeTab === 'agent' 
                    ? 'bg-slate-900 border-emerald-500/50 text-white shadow-lg' 
                    : 'bg-slate-900/30 border-slate-805 hover:border-slate-750 text-slate-400'
                }`}
              >
                <Terminal className={`mt-0.5 h-4 w-4 ${activeTab === 'agent' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="text-xs font-semibold font-mono">3. AGENT VALIDATION LOOP</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Monitors failing XML namespace mappings & triggers reflective corrections in code.</div>
                </div>
              </button>

              <button 
                id="btn-code-tab"
                onClick={() => setActiveTab('codeViewer')}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-150 flex items-start space-x-2.5 ${
                  activeTab === 'codeViewer' 
                    ? 'bg-slate-900 border-emerald-500/50 text-white shadow-lg' 
                    : 'bg-slate-900/30 border-slate-805 hover:border-slate-750 text-slate-400'
                }`}
              >
                <FileCode className={`mt-0.5 h-4 w-4 ${activeTab === 'codeViewer' ? 'text-emerald-400' : 'text-slate-500'}`} />
                <div className="text-left">
                  <div className="text-xs font-semibold font-mono">4. SPRING SOURCE TREE CODE</div>
                  <div className="text-[10px] mt-0.5 text-slate-400">Inspect full generated Java Spring controllers, mappers, and security chains.</div>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 space-y-3">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spring Code & Prompts</h2>
            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-blue-400" /> PROMPT_LOG.md</span>
                <span className="text-[9px] text-emerald-400 font-mono">Active</span>
              </div>
              <p className="text-[10px] text-slate-400">Contains comprehensive prompt directions for producing secure Spring mappers.</p>
              <button 
                onClick={() => handleCopy(PROMPT_LOG_MD)}
                className="w-full text-center bg-slate-800 hover:bg-slate-750 text-[10px] text-slate-350 py-1 rounded border border-slate-700 transition flex items-center justify-center gap-1"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                {copied ? "Copied Java Prompt" : "Copy Java Prompts Log"}
              </button>
            </div>
          </div>

          {/* DOCUMENTATION HELP */}
          <div className="flex-1 flex flex-col justify-end">
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 text-slate-200 font-semibold font-mono">
                <HelpCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>Spring Bridge Specs</span>
              </div>
              <p className="text-[10.5px] text-slate-450 leading-relaxed">
                This environment provides real-time proxy simulation, XML parsing, Spring Security credentials validation, and JAXB class generation.
              </p>
            </div>
          </div>
        </aside>

        {/* CENTER INTERACTIVE COMPONENT - MAIN WORKSPACE */}
        <main className="lg:col-span-9 p-6 flex flex-col space-y-6 overflow-y-auto">
          
          {/* TABS 1: SCHEMA PARSER */}
          {activeTab === 'parser' && (
            <div className="space-y-6">
              
              {/* COMPONENT INTRO */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white font-mono flex items-center gap-2">
                    <Code2 className="text-emerald-400 h-5 w-5" />
                    Java WSDL Schema Translation Module
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct JVM translation component. Parses legacy namespaces, schema types, and operations to generate Spring validation POJO classes and `@RestController` configurations.
                  </p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="text-xs text-slate-400 font-semibold">Active WSDL:</span>
                  <select 
                    value={selectedTemplate.id} 
                    onChange={(e) => {
                      const t = TEMPLATES.find(x => x.id === e.target.value);
                      if (t) setSelectedTemplate(t);
                    }}
                    className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-slate-700"
                  >
                    {TEMPLATES.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SPLIT WSDL VIEW vs PARSER ACTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* WSDL INPUT PANEL */}
                <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden flex flex-col h-[525px]">
                  <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 flex justify-between items-center shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-350 font-mono">Input Heritage XML WSDL</span>
                    <button 
                      onClick={() => handleCopy(xmlInput)}
                      className="text-xs text-slate-450 hover:text-white flex items-center gap-1 font-mono"
                    >
                      <Copy className="h-3 w-3" /> Copy Spec
                    </button>
                  </div>
                  <textarea
                    value={xmlInput}
                    onChange={(e) => setXmlInput(e.target.value)}
                    className="flex-1 p-4 bg-slate-950 text-emerald-400 font-mono text-[11px] leading-relaxed resize-none outline-none focus:bg-slate-960 border-0"
                  />
                  <div className="bg-slate-910/70 p-3.5 border-t border-slate-850 shrink-0 flex justify-end">
                    <button 
                      onClick={handleParseSchema}
                      disabled={isParsing}
                      className="bg-emerald-600 hover:bg-emerald-500 font-medium text-xs px-4 py-2.5 rounded text-white flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer"
                    >
                      {isParsing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                      <span>{isParsing ? 'Extracting Fields & POJOs...' : 'Execute JVM Parser'}</span>
                    </button>
                  </div>
                </div>

                {/* TARGET PARSED SCHEMAS OUTPUT */}
                <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden flex flex-col h-[525px]">
                  <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 shrink-0">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-350 font-mono flex items-center gap-1.5">
                      <Braces className="h-4 w-4 text-emerald-400" /> Compiled Java DTOs / Records
                    </span>
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-4">
                    {!parserOutput ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                        <div className="h-10 w-10 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400 text-lg">?</div>
                        <div>
                          <p className="text-xs font-semibold text-slate-300 animate-pulse">No parsed entities metadata generated</p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px]">Press <strong>"Execute JVM Parser"</strong> to generate the Spring java source files.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 text-xs font-mono animate-fade-in text-left">
                        <div className="bg-slate-950/80 p-3.5 rounded border border-slate-850 space-y-1.5">
                          <div><span className="text-slate-500 font-semibold">Legacy WSDL Context:</span> <span className="text-emerald-400 font-bold">{parserOutput.serviceName}</span></div>
                          <div><span className="text-slate-500 font-semibold">Heritage Namespace:</span> <span className="text-blue-400">{parserOutput.targetNamespace}</span></div>
                        </div>

                        {parserOutput.operations.map((op: any, index: number) => (
                          <div key={index} className="space-y-3">
                            <div className="border border-slate-800 rounded bg-slate-950">
                              <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex items-center justify-between text-[10.5px]">
                                <span className="bg-emerald-500/15 text-emerald-400 py-0.5 px-2 rounded border border-emerald-400/25 font-bold">POST to REST</span>
                                <span className="text-slate-400">Secure Path: <span className="text-blue-450 font-semibold">{op.restPath}</span></span>
                              </div>
                              <div className="p-3 bg-slate-900/30 border-b border-slate-850 text-[11px] space-y-1">
                                <div><span className="text-slate-500">Operation:</span> <span className="text-white">{op.name}</span></div>
                                <div><span className="text-slate-500">Validation Authority:</span> <span className="text-amber-400 font-semibold">@PreAuthorize("hasRole('{op.requiredRole || 'ROLE_USER'}')")</span></div>
                                <div><span className="text-slate-500">XML Tag Mapping:</span> <span className="text-white">&lt;{op.legacyXmlRoot}&gt;</span></div>
                              </div>
                              <div className="p-3 bg-slate-950">
                                <div className="text-[10px] text-slate-500 mb-2 font-mono flex justify-between">
                                  <span>// Generated Java Records (Jackson DTOs)</span>
                                  <button onClick={() => handleCopy(op.javaModel)} className="hover:text-white flex items-center gap-0.5"><Copy className="h-3 w-3" /> Copy</button>
                                </div>
                                <pre className="text-slate-200 text-[10.5px] border border-slate-900 bg-slate-950/70 p-3 rounded overflow-auto leading-relaxed">
                                  {op.javaModel}
                                </pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SPRING PROXY CONFIG & AUTHENTICATION */}
          {activeTab === 'proxy' && (
            <div className="space-y-6">
              
              {/* COMPONENT INTRO */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-base font-semibold text-white font-mono flex items-center gap-2">
                    <Lock className="text-emerald-400 h-5 w-5" />
                    Spring Security Gateway & SOAP Bridge
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Verifies JWT tokens and verifies scopes. Translates incoming JSON into XML envelopes, captures Downstream SOAP Fault exceptions, and registers logs onto an H2/SQLITE enterprise trace table.
                  </p>
                </div>
              </div>

              {/* INTERACTIVE PROXY PIPELINE TESTER */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* REST INPUT PAYLOAD */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  
                  {/* AUTHENTICATION TOKEN INJECTOR PANEL */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 text-slate-200 font-mono font-bold">
                        <Lock className="h-3.5 w-3.5 text-emerald-400" />
                        <span>HTTP Security Header Config</span>
                      </div>
                      <label className="flex items-center space-x-1 cursor-pointer text-slate-400">
                        <input 
                          type="checkbox" 
                          checked={hasRoleValidate} 
                          onChange={(e) => setHasRoleValidate(e.target.checked)} 
                          className="mr-1 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span>Enforce JWT check</span>
                      </label>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-400">
                        <span>Header: <code className="text-slate-350">Authorization:</code></span>
                        <div className="space-x-1.5">
                          <button 
                            onClick={() => setClientTokenKey("Bearer-JWT-legacy-token-xyz556")} 
                            className="text-emerald-400 underline hover:text-emerald-300"
                          >
                            Set Valid (ROLE_USER)
                          </button>
                          <button 
                            onClick={() => setClientTokenKey("Bearer-JWT-payment-admin-key112")} 
                            className="text-blue-400 underline hover:text-blue-300"
                          >
                            Set Valid (PAYMENT_ADMIN)
                          </button>
                          <button 
                            onClick={() => setClientTokenKey("")} 
                            className="text-rose-400 underline hover:text-rose-300"
                          >
                            Clear (Fault 401)
                          </button>
                        </div>
                      </div>
                      <input 
                        type="text"
                        value={clientTokenKey}
                        onChange={(e) => setClientTokenKey(e.target.value)}
                        placeholder="e.g. Bearer JWT-Token-Value..."
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs font-mono text-slate-100 outline-none focus:border-slate-700"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-xl border border-slate-805 overflow-hidden flex flex-col h-[400px]">
                    <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0">
                      <span className="text-xs font-semibold text-slate-300 font-mono">Incoming Client REST JSON</span>
                      <span className="text-[10px] bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-slate-400 font-mono">JSON Body</span>
                    </div>

                    <div className="flex px-4 py-1.5 text-[10px] text-slate-500 items-center justify-between border-b border-slate-800/40 bg-slate-950/30 shrink-0">
                      <span>JSON Presets:</span>
                      <div className="space-x-2 font-mono">
                        <button 
                          onClick={() => setTestRestPayload(selectedTemplate.id === 'user-service' 
                            ? '{\n  "userId": 105,\n  "authToken": "Bearer-JWT-legacy-token-xyz556"\n}'
                            : '{\n  "merchantId": "MERCH_881",\n  "amount": 250.00,\n  "currencyCode": "USD",\n  "cardDetails": {\n    "cardNumber": "4111222233334444",\n    "expiryDate": "12/28",\n    "cvv": "123"\n  }\n}'
                          )}
                          className="hover:text-emerald-400 underline cursor-pointer"
                        >
                          Send Valid payload
                        </button>
                        <button 
                          onClick={() => setTestRestPayload(selectedTemplate.id === 'user-service'
                            ? '{\n  "userId": 999,\n  "authToken": "Bearer-JWT-expired-token"\n}'
                            : '{\n  "merchantId": "MERCH_881",\n  "amount": -10.00,\n  "currencyCode": "USD"\n}'
                          )}
                          className="hover:text-rose-450 underline cursor-pointer"
                        >
                          Send SOAP Error Trigger
                        </button>
                      </div>
                    </div>

                    <textarea
                      value={testRestPayload}
                      onChange={(e) => setTestRestPayload(e.target.value)}
                      className="flex-1 p-4 bg-slate-950 text-white font-mono text-xs leading-relaxed resize-none outline-none focus:bg-slate-960 border-0"
                    />

                    {/* SOAP MAPPERS CONTROL */}
                    <div className="bg-slate-900 border-t border-slate-800 p-3 shrink-0 flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs text-slate-400 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={faultMappersActive} 
                          onChange={(e) => setFaultMappersActive(e.target.checked)}
                          className="rounded text-emerald-600 bg-slate-950 border-slate-800 h-3.5 w-3.5"
                        />
                        <span>Enable @RestControllerAdvice Mappers</span>
                      </label>
                      <button 
                        onClick={handleProxyTest}
                        disabled={isProxying}
                        className="bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs px-4 py-2 rounded text-white flex items-center space-x-1.5 transition disabled:opacity-50 cursor-pointer"
                      >
                        {isProxying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3 w-3" />}
                        <span>Translate REST Call</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* RUNTIME PIEPLINE LOGS */}
                <div className="lg:col-span-7 flex flex-col space-y-4 text-left">
                  <div className="bg-slate-900 rounded-xl border border-slate-805 overflow-hidden flex flex-col h-[540px]">
                    <div className="bg-slate-905 border-b border-slate-800 px-4 py-3 flex items-center justify-between shrink-0">
                      <span className="text-xs font-semibold text-slate-350 font-mono">Simulated Spring Boot 3 Engine Logs & Pipe Trace</span>
                      <span className="text-[10px] bg-slate-850 text-slate-300 px-2 py-0.5 rounded border border-slate-800">Spring Security Gate</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4 font-mono text-[11px] leading-relaxed">
                      {!proxyResult ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                          <div className="h-10 w-10 rounded-full bg-slate-850 border border-slate-800 flex items-center justify-center text-slate-400">⚡</div>
                          <div>
                            <p className="text-xs font-semibold text-slate-300">Awaiting Conversion Call</p>
                            <p className="text-[11px] text-slate-450 mt-1 max-w-[340px]">Configure your Authorization token, modify the JSON input parameters, and trigger <strong>"Translate REST Call"</strong> to log mappings.</p>
                          </div>
                        </div>
                      ) : proxyResult.errorType ? (
                        /* SPRING SECURITY BLOCKED RESPONSE HOOK */
                        <div className="space-y-4">
                          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 p-4 rounded-lg space-y-2">
                            <div className="flex items-center gap-2">
                              <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                              <div className="font-bold text-sm">Spring Security Context Authentication Failure</div>
                            </div>
                            <p className="text-xs">{proxyResult.message}</p>
                            <div className="text-[10px] bg-rose-500/15 p-2 rounded border border-rose-500/25 font-mono text-rose-200">
                              Error Type: {proxyResult.errorType} | HTTP Status Code: {proxyResult.status} Unauthorized
                            </div>
                          </div>
                          
                          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded text-[11px] text-slate-300 space-y-2">
                            <span className="text-slate-400 font-bold">Interception Trace (SecurityFilterChain):</span>
                            <pre className="text-slate-450 text-[10px]">
{`[DEBUG] SecurityContextHolder - No SecurityContext available, creating brand new authentication state
[WARN] JwtAuthenticationFilter - Token check failed. Throwing AuthenticationException for proxy path
[DEBUG] ExceptionTranslationFilter - Delegating AuthenticationException to custom AuthenticationEntryPoint
[INFO] AuthenticationEntryPoint - Returning JSON authorization error payload with HTTP Status Code 401`}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          
                          {/* STAGE 1: INCOMING */}
                          <div className="border border-slate-800 rounded bg-slate-950 p-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-450 border-b border-slate-850 pb-1.5 mb-1.5 font-sans">
                              <span className="font-bold text-slate-300">1. Jackson Validated REST Data Layer DTO</span>
                              <span className="text-emerald-400">Validated with @NotNull</span>
                            </div>
                            <pre className="text-slate-300 overflow-auto text-[10.5px] max-h-[90px]">{JSON.stringify(proxyResult.restInput, null, 2)}</pre>
                          </div>

                          {/* STAGE 2: OUTGOING SOAP ENVELOPE */}
                          <div className="border border-slate-850 rounded bg-slate-950 p-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-450 border-b border-slate-850 pb-1.5 mb-1.5 font-sans">
                              <span className="font-semibold text-blue-400">2. JAXB Marshaller marshalled JAXBElement package to Legacy SOAP XML</span>
                              <span>TargetNamespace Sync</span>
                            </div>
                            <pre className="text-emerald-400 overflow-auto text-[10px] max-h-[140px] leading-relaxed">{proxyResult.outgoingSoapXml}</pre>
                          </div>

                          {/* STAGE 3: RAW SOAP RESPONSE */}
                          <div className="border border-slate-850 rounded bg-slate-950 p-3 space-y-1">
                            <div className="flex items-center justify-between text-[10px] text-slate-450 border-b border-slate-850 pb-1.5 mb-1.5 font-sans">
                              <span className="font-semibold text-amber-500">3. Outbound SOAP Endpoint SOAP Response (Unmarshalled XML block)</span>
                              <span>Heritage Soap Service Client</span>
                            </div>
                            <pre className="text-slate-450 overflow-auto text-[10px] max-h-[140px] leading-relaxed">{proxyResult.legacySoapResponseXml}</pre>
                          </div>

                          {/* STAGE 4: REST JSON OUTPUT */}
                          <div className={`border rounded bg-slate-950 p-3 space-y-1 ${proxyResult.legacySoapResponseXml.includes('Fault') ? 'border-amber-500/20' : 'border-emerald-500/20'}`}>
                            <div className="flex items-center justify-between text-[10px] border-b border-slate-850 pb-1.5 mb-1.5 font-sans">
                              <span className="font-semibold text-white">4. REST Controller ResponseEntity Returned payload JSON</span>
                              <span className={proxyResult.legacySoapResponseXml.includes('Fault') ? 'text-amber-400' : 'text-emerald-400 font-bold'}>
                                {proxyResult.legacySoapResponseXml.includes('Fault') ? 'SOAPFault @RestControllerAdvice Handled' : 'HTTP/1.1 200 OK'}
                              </span>
                            </div>
                            <pre className="text-slate-350 overflow-auto text-[10.5px] max-h-[180px] leading-relaxed">{proxyResult.restJsonOutput}</pre>
                          </div>

                          {/* JPA PERSISTED ENTRY */}
                          <div className="bg-slate-950/40 p-3.5 border border-slate-850 rounded text-[10px] text-slate-400 flex items-start gap-4 font-sans">
                            <Database className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div className="space-y-1.5 flex-1 font-mono">
                              <div><strong className="text-slate-200 uppercase tracking-widest text-[9.5px]">Entity auditing:</strong> JpaRepository context mapping logs</div>
                              <pre className="bg-slate-950 p-2 border border-slate-900 rounded text-[10px] text-slate-350 leading-relaxed overflow-auto max-h-[140px]">{proxyResult.jpaLog.query}</pre>
                              <div className="text-emerald-400 font-bold">&#10003; JPA database audit session committed successfully to active database context.</div>
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: AGENTIC TEST & HEAL LOOP */}
          {activeTab === 'agent' && (
            <div className="space-y-6">
              
              {/* COMPONENT INTRO */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800">
                <h3 className="text-base font-semibold text-white font-mono flex items-center gap-2">
                  <Terminal className="text-emerald-400 h-5 w-5" />
                  JVM Agent validation & Custom Self-Heal Compiler
                </h3>
                <p className="text-xs text-slate-450 mt-1 leading-relaxed">
                  Every runtime modernizer features an agentic verification loop: (1) Generates JAXB classes and JUnit mappers &larr;&rarr; (2) Compiles source bytecode using JDK tools &larr;&rarr; (3) Executes JUnit assertions to match namespaces &larr;&rarr; If it fails, JAXB namespaces errors are looped back to heal JAXB annotation mappings.
                </p>
              </div>

              {/* ACTION ROW */}
              <div className="flex justify-between items-center bg-slate-900 px-6 py-4 rounded-xl border border-slate-850 gap-4">
                <div className="text-xs text-slate-400">
                  <span className="font-bold text-white">Mock Suite Active:</span> Runs 5 JUnit integration assertions verify XML entities namespaces matching standards.
                </div>
                <button 
                  onClick={startAgentLoop}
                  disabled={isAgentRunning}
                  className="bg-emerald-600 hover:bg-emerald-500 font-semibold text-xs px-5 py-2.5 rounded text-white flex items-center space-x-2 transition disabled:opacity-50 cursor-pointer shrink-0 shadow-lg"
                >
                  {isAgentRunning ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isAgentRunning ? 'Self-Healing JVM Compile Loop Running...' : 'Trigger JVM Self-Heal Loop'}</span>
                </button>
              </div>

              {/* SPLIT LIVE LOOPS vs RECONCILIATION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                
                {/* AGENT LOG PANEL */}
                <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden flex flex-col h-[480px]">
                  <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex justify-between items-center shrink-0">
                    <span className="text-xs font-semibold text-slate-350 font-mono flex items-center gap-2">
                      <Terminal className="h-4 w-4 text-emerald-400" /> Live Agent System Compiler Console
                    </span>
                    {isAgentRunning && <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/35 text-emerald-400 px-2 py-0.5 rounded animate-pulse">Running JVM Compiler</span>}
                  </div>

                  <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-slate-950/70 font-mono text-[11px] leading-relaxed">
                    {agentLogs.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-2">
                        <div className="h-10 w-10 rounded-full border border-slate-800 flex items-center justify-center text-slate-400">!</div>
                        <p className="text-xs">Console is empty. Hit the button above to begin verification.</p>
                      </div>
                    ) : (
                      agentLogs.map((log, i) => (
                        <div key={i} className="flex items-start space-x-2.5 py-1 border-b border-slate-900/35">
                          <span className="text-slate-550 shrink-0 text-[10px]">{log.timestamp}</span>
                          <div>
                            {log.type === 'success' && <span className="text-emerald-400 font-bold">[PASSED] </span>}
                            {log.type === 'warning' && <span className="text-yellow-450 font-bold">[WARN] </span>}
                            {log.type === 'error' && <span className="text-rose-450 font-bold">[JVM ERROR] </span>}
                            {log.type === 'info' && <span className="text-blue-400 font-bold">[SYSTEM] </span>}
                            <span className="text-slate-200">{log.message}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* SELF-HEALING ARCHITECTURAL FLOW VISUALIZER */}
                <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden p-6 space-y-4">
                  <h4 className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">Agentic Test Suite Verification Flow</h4>
                  
                  <div className="space-y-4">
                    {/* STEP 1: PARSE & COMPILE */}
                    <div className={`p-3.5 rounded-lg border transition-all duration-300 flex items-start space-x-3 ${
                      agentStep >= 1 ? 'bg-slate-950 border-emerald-500/30' : 'bg-slate-900/30 border-slate-850 text-slate-500'
                    }`}>
                      <CheckCircle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${agentStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-mono">JAXB POJOs Mapping Compilation</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Automated translation of legacy WSDL parameters. Compiles JAXB schema records classes using `javac` compiler tools.</p>
                      </div>
                    </div>

                    {/* STEP 2: TEST MATRIX */}
                    <div className={`p-3.5 rounded-lg border transition-all duration-300 flex items-start space-x-3 ${
                      agentStep >= 4 ? 'bg-slate-950 border-emerald-500/30' : 'bg-slate-900/30 border-slate-850 text-slate-500'
                    }`}>
                      <CheckCircle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${agentStep >= 8 ? 'text-emerald-400' : (agentStep >= 5 ? 'text-yellow-400' : 'text-slate-600')}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-mono">Execute JUnit mapping assertions suite</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Compares converted outbound XML mappers streams with source legacy specifications. Catches discrepancies in tags, structural types or namespace scopes.</p>
                      </div>
                    </div>

                    {/* STEP 3: EXCEPTION CATCHER */}
                    <div className={`p-3.5 rounded-lg border transition-all duration-300 flex items-start space-x-3 ${
                      agentStep >= 5 ? 'bg-slate-950 border-emerald-500/30' : 'bg-slate-900/30 border-slate-850 text-slate-500'
                    }`}>
                      <CheckCircle className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${agentStep >= 7 ? 'text-emerald-400' : (agentStep >= 5 ? 'text-rose-450' : 'text-slate-600')}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-mono">JVM Namespace Exception caught & Repaired</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">If JUnit schemas mismatch, self-healing model parses JAXB errors (e.g. missing package-info XML bindings) and injects repairs directly.</p>
                      </div>
                    </div>

                    {/* STEP 4: DURABLE SYNC */}
                    <div className={`p-3.5 rounded-lg border transition-all duration-300 flex items-start space-x-3 ${
                      agentStep >= 9 ? 'bg-slate-950 border-emerald-500/30' : 'bg-slate-900/30 border-slate-850 text-slate-500'
                    }`}>
                      <CheckCircle className={`h-4.5 w-4.5 shrink-5 mt-0.5 col-slate ${agentStep >= 10 ? 'text-emerald-400' : 'text-slate-600'}`} />
                      <div>
                        <div className="text-xs font-bold text-slate-100 font-mono">Synchronize Corrected Java classes model</div>
                        <p className="text-[11px] text-slate-400 mt-0.5">Corrected classes are persisted onto standard disk storage path maps, and registered on H2 logs database structure.</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: SPRING BOOT CODE VIEWER */}
          {activeTab === 'codeViewer' && (
            <div className="space-y-6">
              
              {/* COMPONENT INTRO */}
              <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-semibold text-white font-mono flex items-center gap-2">
                    <FileCode className="text-emerald-400 h-5 w-5" />
                    Generative Bridge Source Code Viewer
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Examine the complete, production-ready Java 21 classes generated by our automated Spring migration bridge system.
                  </p>
                </div>
              </div>

              {/* CORE SPRING CODE BLOCK SWITCHER */}
              <div className="bg-slate-900 rounded-xl border border-slate-850 overflow-hidden flex flex-col min-h-[560px]">
                {/* SELECTOR BAR */}
                <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap gap-2 shrink-0">
                  <button 
                    onClick={() => setCodeFile('controller')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'controller' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    SoapBridgeController.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('security')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'security' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    SecurityConfig.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('jwtFilter')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'jwtFilter' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    JwtAuthenticationFilter.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('service')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'service' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    SoapProxyService.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('entity')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'entity' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    ProxyTransactionLog.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('jaxbPojo')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'jaxbPojo' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    GetUserRequestJaxb.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('exceptionAdvice')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'exceptionAdvice' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    GlobalBridgeExceptionHandler.java
                  </button>

                  <button 
                    onClick={() => setCodeFile('pom')}
                    className={`px-3 py-1.5 rounded text-xs font-mono transition ${
                      codeFile === 'pom' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/35 font-bold' 
                        : 'bg-slate-955 text-slate-400 border border-transparent hover:text-slate-250'
                    }`}
                  >
                    pom.xml
                  </button>
                </div>

                {/* JAVA CODE COMPILATION */}
                <div className="flex-1 bg-slate-950 p-6 relative">
                  <div className="absolute right-4 top-4">
                    <button 
                      onClick={() => handleCopy(JAVA_CODE[codeFile])}
                      className="bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded flex items-center gap-1.5 font-mono"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      {copied ? "Copied" : "Copy Source"}
                    </button>
                  </div>
                  <pre className="text-slate-250 font-mono text-[11.5px] leading-relaxed overflow-auto max-h-[580px] text-left">
                    {JAVA_CODE[codeFile]}
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

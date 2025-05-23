
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { LifeBuoy, Mail, MessageSquare, Phone } from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      question: "How do I create a new subscription plan?",
      answer: "Navigate to 'Configure Subscriptions' in the sidebar, then click on 'Create New Plan'. Fill out the required details including permissions, limits, and pricing, then click Save."
    },
    {
      question: "How do I add a new company/client?",
      answer: "You can add a new client by clicking 'Create New Account' on the dashboard, or from a subscription plan page by clicking 'Add Subscriber'. Fill in the company details and assign them to a plan."
    },
    {
      question: "How do I generate an invoice for a client?",
      answer: "Open the client's company details page, then click the 'Generate Invoice' button. The system will pre-fill the invoice with the client's information. Review and submit to send the invoice."
    },
    {
      question: "Can I change a client's subscription plan?",
      answer: "Yes. Navigate to the client's details page and click 'Change Plan'. Select the new plan from the dropdown and save the changes."
    },
    {
      question: "How are storage limits calculated?",
      answer: "Storage limits are defined in each subscription plan in gigabytes (GB). When you assign a plan to a company, they are allocated the storage amount specified in that plan."
    },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Help Center</h1>
        <p className="text-muted-foreground">Support resources and documentation</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <MessageSquare className="h-5 w-5 text-orange-500 mr-2" />
              Knowledge Base
            </CardTitle>
            <CardDescription>
              Browse articles and documentation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Access detailed guides and tutorials to learn how to make the most of the 
              Digital Archive System.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <LifeBuoy className="h-5 w-5 text-orange-500 mr-2" />
              Technical Support
            </CardTitle>
            <CardDescription>
              Get help from our support team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              Contact our dedicated support team for assistance with technical issues 
              or advanced configuration needs.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center">
              <Phone className="h-5 w-5 text-orange-500 mr-2" />
              Contact Us
            </CardTitle>
            <CardDescription>
              Reach out via email or phone
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>support@taloinnovations.com</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="pt-4">
        <h2 className="text-xl font-medium mb-4">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default Help;

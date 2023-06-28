'use client';
/*eslint-disable*/

import Link from '@/components/link/Link';
import MessageBoxChat from '@/components/MessageBox';
import { ChatBody, OpenAIModel } from '@/types/types';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Img,
  Input,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { MdAutoAwesome, MdBolt, MdEdit, MdPerson } from 'react-icons/md';
import Bg from '../public/img/chat/bg-image.png';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';

export default function Chat(props: { apiKeyApp: string }) {
  // *** If you use .env.local variable for your API key, method which we recommend, use the apiKey variable commented below
  const { apiKeyApp } = props;
  // Input States
  const [inputOnSubmit, setInputOnSubmit] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  // Response message
  const [outputCode, setOutputCode] = useState<string>('');

  // Chat messages
  const [chatHistory, setChatHistory] = useState<{role:string, message:string}[]>([]);

  // ChatGPT model
  const [model, setModel] = useState<OpenAIModel>('gpt-3.5-turbo');
  // Loading state
  const [loading, setLoading] = useState<boolean>(false);
  // Project ID
  const [agentProjectGuid, setAgentProjectGuid] = useState<string | null>('');

  // API Key
  // const [apiKey, setApiKey] = useState<string>(apiKeyApp);
  const borderColor = useColorModeValue('gray.200', 'whiteAlpha.200');
  const inputColor = useColorModeValue('navy.700', 'white');
  const iconColor = useColorModeValue('brand.500', 'white');
  const bgIcon = useColorModeValue(
    'linear-gradient(180deg, #FBFBFF 0%, #CACAFF 100%)',
    'whiteAlpha.200',
  );
  const brandColor = useColorModeValue('brand.500', 'white');
  const buttonBg = useColorModeValue('white', 'whiteAlpha.100');
  const gray = useColorModeValue('gray.500', 'white');
  const buttonShadow = useColorModeValue(
    '14px 27px 45px rgba(112, 144, 176, 0.2)',
    'none',
  );
  const textColor = useColorModeValue('navy.700', 'white');
  const placeholderColor = useColorModeValue(
    { color: 'gray.500' },
    { color: 'whiteAlpha.600' },
  );

  useEffect(() => {
    let connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7225/agentHub', {
        withCredentials: false,
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

      connection.start().catch((err) => console.error(err.toString()));

      connection.on('agent_info', (data) => {
        const goals = data.goals.map((goal: string) => `- ${goal}\n`).join('');
        const message = `Goals: \n\n${goals}\n\n`;
        addMessage('agent', message);
      });

      connection.on('thoughts', (response) => {
        if  (!response.text && !response.plan) return;
        
        let message = `${response.text}${response.plan ? '\n\nPlan: \n' + response.plan + '\n' : ''}`;
        // let message = `
        //   Text: ${response.text}\n
        //   Reasoning: ${response.reasoning}\n
        //   Plan: ${response.plan}\n
        //   Criticism: ${response.criticism}\n
        //   Speak: ${response.speak}\n\n
        // `;
        addMessage('agent', message);
      });

      connection.on('respond', (response) => {
        if (response === 'Task completed.') {
          setAgentProjectGuid(null);
          setLoading(false);
        }
        addMessage('agent', response);
      });

      connection.on('ask', (response) => {
        addMessage('agent', response);
        setLoading(false);
      });

  }, []);
  
  const handleTranslate = async () => {
    let input = document.getElementById('input') as HTMLInputElement;
    setInputOnSubmit(inputCode);
    addMessage('user', inputCode);
    input.value = '';

    setLoading(true);
    axios.post('https://localhost:7225/getreplyfromagent', {
      userGUIdString: "4949C1A2-AEA5-4B75-BFEE-A0A80F80032E",
      agentGUIdString: "E8D6B1FD-AA69-41E1-97BE-B9755C1FA7A6",
      userPrompt: inputCode,
      agentProjectGuid: agentProjectGuid || null,
    })
    .then((response) => {
      if (response.data.agentProjectGuid) {
        setAgentProjectGuid(response.data.agentProjectGuid);
      } else {
        addMessage('agent', response.data.response);
        if (response.data.response !== 'Thinking...') {
          setLoading(false);
        }
      }
    })
    .catch((err) => {
      console.error(err.toString());
      setLoading(false);
    });
  };

  const handleChange = (Event: any) => {
    setInputCode(Event.target.value);
  };

  const handleKeyDown = (event: { key: string; }) => {
    if (event.key === 'Enter') {
      handleTranslate();
    }
  };

  const addMessage = (role: string, message: string) => {
      setChatHistory((prevHistory) => [...prevHistory, { role, message }]);
      let element = document.getElementById('chatbox');
      element.scrollTop = element.scrollHeight + 200;
  }

  return (
    <Flex
      w="100%"
      pt={{ base: '70px', md: '0px' }}
      direction="column"
      position="relative"
    >
      <Img
        src={Bg.src}
        position={'absolute'}
        w="350px"
        left="50%"
        top="50%"
        transform={'translate(-50%, -50%)'}
      />
      <Flex
        direction="column"
        mx="auto"
        w={{ base: '100%', md: '100%', xl: '100%' }}
        minH={{ base: '75vh', '2xl': '85vh' }}
        maxW="1000px"
      >
        {/* Main Box */}
        <Flex direction="column"
            id="chatbox"
            w="100%"
            h={{ base: '81vh' }}
            mx="auto"
            display={'flex'}
            mb={'auto'}
          overflowY={'scroll'}
            >
          {chatHistory.map((message, index) => {
            return <>
              <Flex
            direction="column"
            w="100%"
            mx="auto"
            display={'flex'}
          >
            <Flex w="100%" align={'center'} mb="10px">
            {message.role === 'user' ? <Flex
                borderRadius="full"
                justify="center"
                align="center"
                bg={'transparent'}
                border="1px solid"
                borderColor={borderColor}
                me="20px"
                h="40px"
                minH="40px"
                minW="40px"
              >
                <Icon
                  as={MdPerson}
                  width="20px"
                  height="20px"
                  color={brandColor}
                />
              </Flex>
              : <Flex
              borderRadius="full"
              justify="center"
              align="center"
              bg={'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)'}
              me="20px"
              h="40px"
              minH="40px"
              minW="40px"
            >
              <Icon
                as={MdAutoAwesome}
                width="20px"
                height="20px"
                color="white"
              />
            </Flex>
          }
              <Flex
                p="22px"
                border="1px solid"
                borderColor={borderColor}
                borderRadius="14px"
                w="100%"
                zIndex={'2'}
              >
                <Text
                  color={textColor}
                  fontWeight="600"
                  fontSize={{ base: 'sm', md: 'md' }}
                  lineHeight={{ base: '24px', md: '26px' }}
                  whiteSpace={'pre-wrap'}
                >
                  {message.message.toString()}
                </Text>
              </Flex>
            </Flex>
            </Flex>
            </>
            })
          }
        </Flex>
        {/* Chat Input */}
        <Flex
          ms={{ base: '0px', xl: '60px' }}
          mt="20px"
          justifySelf={'flex-end'}
        >
          <Input
            id="input"
            minH="54px"
            h="100%"
            border="1px solid"
            borderColor={borderColor}
            borderRadius="45px"
            p="15px 20px"
            me="10px"
            fontSize="sm"
            fontWeight="500"
            _focus={{ borderColor: 'none' }}
            color={inputColor}
            _placeholder={placeholderColor}
            placeholder="Type your message here..."
            onChange={handleChange}
            onKeyDown={handleKeyDown}
          />
          <Button
            variant="primary"
            py="20px"
            px="16px"
            fontSize="sm"
            borderRadius="45px"
            ms="auto"
            w={{ base: '160px', md: '210px' }}
            h="54px"
            _hover={{
              boxShadow:
                '0px 21px 27px -10px rgba(96, 60, 255, 0.48) !important',
              bg:
                'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%) !important',
              _disabled: {
                bg: 'linear-gradient(15.46deg, #4A25E1 26.3%, #7B5AFF 86.4%)',
              },
            }}
            onClick={handleTranslate}
            isLoading={loading ? true : false}
          >
            Submit {loading}
          </Button>
          {loading}
        </Flex>
      </Flex>
    </Flex>
  );
}

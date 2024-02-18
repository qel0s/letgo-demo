import Head from 'next/head';
import Image from 'next/image';
import { Roboto } from 'next/font/google';
import {
  Avatar,
  Button,
  Card,
  Col,
  Input,
  List,
  Modal,
  Row,
  Space,
  Tooltip,
  message,
} from 'antd';
import { useQuery } from 'react-query';
import { Token } from '@/types/types';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Retryer } from 'react-query/types/core/retryer';

const { Search } = Input;

const roboto = Roboto({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-roboto',
  display: 'swap',
});

const API_URL = 'https://api2.binance.com/api/v3/ticker/24hr';

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(5);

  const [myTokens, setMyTokens] = useState([] as Token[]);
  const [allTokens, setAllTokens] = useState([] as Token[] | undefined);

  const { data, isLoading, isError, refetch } = useQuery(
    'data',
    async (): Promise<Token[]> => {
      const response = await axios.get<Token[]>(API_URL);
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
      refetchInterval: 300000,
    }
  );

  useEffect(() => {
    const initialTokens = localStorage.getItem('myTokens');
    if (initialTokens) {
      setMyTokens(JSON.parse(initialTokens));
    }
  }, []);

  useEffect(() => {
    if (data) {
      const initialTokens: Token[] | null = JSON.parse(
        localStorage.getItem('myTokens') || 'null'
      );
      if (initialTokens?.length) {
        setAllTokens(
          data.map((d) => {
            const myToken = initialTokens?.find((i) => i.symbol == d.symbol);
            if (myToken) {
              return { ...myToken, amountInput: myToken.amount };
            } else {
              return d;
            }
          })
        );
      } else {
        setAllTokens(data);
      }
    }
  }, [data]);

  return (
    <div style={{ padding: 32 }} className={roboto.className}>
      <Row gutter={[32, 32]}>
        <Col span={24} lg={24}>
          <Card>
            <Space>
              <Button
                onClick={() => {
                  setIsModalOpen(true);
                }}
                type="primary"
              >
                Add Stock
              </Button>
              <Button type="primary" danger>
                Refresh
              </Button>
            </Space>
          </Card>
        </Col>

        <Col span={24} lg={8}>
          <Card>
            <List
              pagination={{ pageSize: 5 }}
              dataSource={myTokens || []}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#87d068' }}
                        shape="square"
                        size="large"
                      >
                        {item.symbol}
                      </Avatar>
                    }
                    title={
                      <Tooltip placement="top" title={'Last Price'}>
                        {item.lastPrice}
                      </Tooltip>
                    }
                    description={
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Tooltip
                          placement="top"
                          title={'Weighted Average Price'}
                        >
                          {item.weightedAvgPrice}
                        </Tooltip>

                        <Space wrap>
                          <Input
                            value={item.amount || 0}
                            onChange={(e) => {}}
                            placeholder="Input a number"
                            maxLength={16}
                            type="number"
                          />
                          <Button onClick={() => {
                            
                          }} type="primary">
                            Update
                          </Button>
                          <Button
                            onClick={() => {
                              const updatedMyTokens = myTokens.filter(
                                (myToken) => myToken.symbol !== item.symbol
                              );
                              setMyTokens(updatedMyTokens);
                              localStorage.setItem(
                                'myTokens',
                                JSON.stringify(updatedMyTokens)
                              );
                            }}
                            type="primary"
                            danger
                          >
                            Remove
                          </Button>
                        </Space>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col span={24} lg={16}>
          <Card></Card>
        </Col>
      </Row>

      <Modal
        title="Search"
        open={isModalOpen}
        onOk={() => {}}
        onCancel={() => {
          setIsModalOpen(false);
        }}
        width={1000}
      >
        <Search
          onSearch={(text) => {
            if (text) {
              setAllTokens(
                data?.filter((d) =>
                  d.symbol.toLowerCase().includes(text.toLowerCase())
                )
              );
            } else {
              setAllTokens(data);
            }
          }}
          placeholder="Search"
        />
        <List
          pagination={{
            pageSize: pageSize,
            onShowSizeChange: (current, size) => {
              setPageSize(size);
            },
          }}
          loading={isLoading}
          dataSource={allTokens || []}
          renderItem={(item, index) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar
                    style={{ backgroundColor: '#87d068' }}
                    shape="square"
                    size="large"
                  >
                    {item.symbol}
                  </Avatar>
                }
                title={
                  <Tooltip placement="top" title={'Last Price'}>
                    {item.lastPrice}
                  </Tooltip>
                }
                description={
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Tooltip placement="top" title={'Weighted Average Price'}>
                      {item.weightedAvgPrice}
                    </Tooltip>

                    <Space wrap>
                      <Input
                        value={item.amountInput || 0}
                        onChange={(e) => {
                          setAllTokens(
                            allTokens?.map((token) => {
                              if (token.symbol != item.symbol) {
                                return token;
                              } else {
                                return {
                                  ...token,
                                  amountInput: parseInt(e.target.value),
                                };
                              }
                            })
                          );
                        }}
                        placeholder="Input a number"
                        maxLength={16}
                        type="number"
                      />
                      {!myTokens.some(
                        (token) => token.symbol == item.symbol
                      ) ? (
                        <Button
                          style={{ marginRight: 109 }}
                          onClick={() => {
                            if (item?.amountInput && item?.amountInput > 0) {
                              const updatedMyTokens = [
                                ...myTokens,
                                { ...item, amount: item.amountInput },
                              ];
                              setMyTokens(updatedMyTokens);
                              localStorage.setItem(
                                'myTokens',
                                JSON.stringify(updatedMyTokens)
                              );
                            } else {
                              message.error('Please enter a valid amount!');
                            }
                          }}
                          type="primary"
                        >
                          Add
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => {
                              setMyTokens(
                                myTokens.map((myToken) => {
                                  if (item.symbol == myToken.symbol) {
                                    return {
                                      ...item,
                                      amount: item.amountInput,
                                    };
                                  } else {
                                    return myToken;
                                  }
                                })
                              );
                            }}
                            type="primary"
                          >
                            Update
                          </Button>
                          <Button
                            onClick={() => {
                              const updatedMyTokens = myTokens.filter(
                                (myToken) => myToken.symbol !== item.symbol
                              );
                              setMyTokens(updatedMyTokens);
                              localStorage.setItem(
                                'myTokens',
                                JSON.stringify(updatedMyTokens)
                              );
                            }}
                            type="primary"
                            danger
                          >
                            Remove
                          </Button>
                        </>
                      )}
                    </Space>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
}

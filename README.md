# spike

A standin development enviroment that emulates functions as a service.

![Spike](./spike_shrug_small.png)

## 📎 background

Offers JSON driven configuration for setting up and binding  Web `Workers` per Function and mapping http2/1 messages.

## 📎 service bus

The service bus is single directional (http to worker).

## 📎 replyPort

Replay messaging for http is performed on side channel `MessageChannel`/`MessagePort`, that is included in the original request message.

## 📎 routing

HTTP routing is acived via mapping service namepsace (`irn`) over the base applications `irn`, creating a relitive path used for HTTP routing (and thus selection of `Worker` as message target).



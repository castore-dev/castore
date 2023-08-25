import type {
  FormData as _FormData,
  Headers as _Headers,
  HeadersInit as _HeadersInit,
  BodyInit as _BodyInit,
  Request as _Request,
  RequestInit as _RequestInit,
  RequestInfo as _RequestInfo,
  RequestMode as _RequestMode,
  RequestRedirect as _RequestRedirect,
  RequestCredentials as _RequestCredentials,
  RequestDestination as _RequestDestination,
  ReferrerPolicy as _ReferrerPolicy,
  Response as _Response,
  ResponseInit as _ResponseInit,
  ResponseType as _ResponseType,
} from 'undici';

declare global {
  export const {
    fetch,
    FormData,
    Headers,
    Request,
    Response,
  }: typeof import('undici');

  type FormData = _FormData;
  type Headers = _Headers;
  type HeadersInit = _HeadersInit;
  type BodyInit = _BodyInit;
  type Request = _Request;
  type RequestInit = _RequestInit;
  type RequestInfo = _RequestInfo;
  type RequestMode = _RequestMode;
  type RequestRedirect = _RequestRedirect;
  type RequestCredentials = _RequestCredentials;
  type RequestDestination = _RequestDestination;
  type ReferrerPolicy = _ReferrerPolicy;
  type Response = _Response;
  type ResponseInit = _ResponseInit;
  type ResponseType = _ResponseType;
}

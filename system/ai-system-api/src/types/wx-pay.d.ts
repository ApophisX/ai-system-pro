declare global {
  namespace WxPay {
    interface WxPayBase {
      appid: string;
      mchid: string;
    }

    interface WxPayMiniProgramRequestParams {
      description: string;
      out_trade_no: string;
      amount: {
        total: number;
        currency?: string;
      };
      scene_info?: WxPaySceneInfoDto;
      attach?: string;
      support_fapiao?: boolean;
      notify_url: string;
      payer: {
        openid: string;
      };
    }

    interface WxPayAttach {
      type: 'order' | 'order_installment' | 'order_renewal' | 'deposit' | 'order_overdue_fee';
      orderNo?: string;
    }

    interface WxPaySceneInfoDto {
      payer_client_ip: string;
      device_id?: string;
      store_info?: {
        id: string;
        name?: string;
        area_code?: string;
        address?: string;
      };
      h5_info?: {
        type: 'Wap' | 'iOS' | 'Android';
        app_name?: string;
        app_url?: string;
        bundle_id?: string;
        package_name?: string;
      };
    }

    interface WxPayNotifyResponse {
      id: string;
      create_time: string;
      resource_type: string;
      event_type: 'TRANSACTION.SUCCESS' | 'REFUND.SUCCESS' | 'REFUND.ABNORMAL' | 'REFUND.CLOSED';
      summary: string;
      resource: {
        original_type: string;
        algorithm: string;
        ciphertext: string;
        associated_data: string;
        nonce: string;
      };
    }

    // 签名
    interface WxPaySignParams {
      timestamp: string | number;
      nonce: string;
      body: Record<string, any> | string;
      signature: string;
      serial: string;
    }

    interface ToWxPayNotifyResponse {
      code: 'SUCCESS' | 'FAIL';
      message: string;
    }

    // 退款
    namespace Refund {
      interface RequestParams {
        transaction_id?: string;
        out_trade_no?: string;
        out_refund_no: string;
        notify_url?: string;
        reason?: string;
        from?: { account: string; amount: number };
        amount: {
          total: number;
          refund: number;
          currency: string;
        };
      }

      interface Result {
        refund_id: string;
        out_refund_no: string;
        transaction_id: string;
        out_trade_no: string;
        channel: string;
        user_received_account: string;
        success_time: Date;
        create_time: Date;
        /**
         * 【退款状态】退款单的退款处理状态。
         * - SUCCESS: 退款成功
         * - CLOSED: 退款关闭
         * - PROCESSING: 退款处理中
         * - ABNORMAL: 退款异常，退款到银行发现用户的卡作废或者冻结了，导致原路退款银行卡失败，可前往商户平台-交易中心，手动处理此笔退款，可参考： 退款异常的处理，或者通过发起异常退款接口进行处理。
         * - 注：状态流转说明请参考状态流转图
         */
        status: 'SUCCESS' | 'CLOSE' | 'PROCESSING' | 'ABNORMAL';
        funds_account: string;
        amount: Amount;
        promotion_detail: PromotionDetail[];
      }
      interface Amount {
        total: number;
        refund: number;
        from: From[];
        payer_total: number;
        payer_refund: number;
        settlement_refund: number;
        settlement_total: number;
        discount_refund: number;
        currency: string;
        refund_fee: number;
      }
      interface From {
        account: string;
        amount: number;
      }
      interface PromotionDetail {
        promotion_id: string;
        scope: string;
        type: string;
        amount: number;
        refund_amount: number;
        goods_detail: GoodsDetail[];
      }
      interface GoodsDetail {
        merchant_goods_id: string;
        wechatpay_goods_id: string;
        goods_name: string;
        unit_price: number;
        refund_amount: number;
        refund_quantity: number;
      }
    }

    namespace Notify {
      interface TransactionResult {
        transaction_id: string;
        amount: {
          payer_total: number;
          total: number;
          currency: string;
          payer_currency: string;
        };
        mchid: string;
        /**
         * SUCCESS：支付成功
         * REFUND：转入退款
         * NOTPAY：未支付
         * CLOSED：已关闭
         * REVOKED：已撤销（仅付款码支付会返回）
         * USERPAYING：用户支付中（仅付款码支付会返回）
         * PAYERROR：支付失败（仅付款码支付会返回）
         */
        trade_state: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'PAYERROR';
        bank_type: string;
        promotion_detail: PromotionDetail[];
        success_time: string;
        payer: {
          openid: string;
        };
        out_trade_no: string;
        appid: string;
        trade_state_desc: string;
        trade_type: string;
        attach: string;
        scene_info: {
          device_id: string;
        };
      }

      interface PromotionDetail {
        amount: number;
        wechatpay_contribute: number;
        coupon_id: string;
        scope: string;
        merchant_contribute: number;
        name: string;
        other_contribute: number;
        currency: string;
        stock_id: string;
        goods_detail: GoodsDetail[];
      }

      interface GoodsDetail {
        goods_remark: string;
        quantity: number;
        discount_amount: number;
        goods_id: string;
        unit_price: number;
      }

      interface RefundResult {
        mchid: string;
        transaction_id: string;
        out_trade_no: string;
        refund_id: string;
        out_refund_no: string;
        refund_status: 'SUCCESS' | 'CLOSED' | 'PROCESSING' | 'ABNORMAL';
        success_time: string;
        user_received_account: string;
        amount: {
          total: number;
          refund: number;
          payer_total: number;
          payer_refund: number;
        };
      }
    }

    // 订单
    namespace Order {
      export interface Result {
        appid: string;
        mchid: string;
        out_trade_no: string;
        transaction_id: string;
        trade_type: string;
        trade_state: 'SUCCESS' | 'REFUND' | 'NOTPAY' | 'CLOSED' | 'REVOKED' | 'USERPAYING' | 'ACCEPT' | 'ABNORMAL';
        trade_state_desc: string;
        bank_type: string;
        attach: string;
        success_time: Date;
        payer: Payer;
        amount: Amount;
        scene_info: SceneInfo;
        promotion_detail: PromotionDetail[];
      }

      export interface Amount {
        total: number;
        payer_total: number;
        currency: string;
        payer_currency: string;
      }

      export interface Payer {
        openid: string;
      }

      export interface PromotionDetail {
        coupon_id: string;
        name: string;
        scope: string;
        type: string;
        amount: number;
        stock_id: string;
        wechatpay_contribute: number;
        merchant_contribute: number;
        other_contribute: number;
        currency: string;
        goods_detail: GoodsDetail[];
      }

      export interface GoodsDetail {
        goods_id: string;
        quantity: number;
        unit_price: number;
        discount_amount: number;
        goods_remark: string;
      }

      export interface SceneInfo {
        device_id: string;
      }
    }
  }
}
export {};

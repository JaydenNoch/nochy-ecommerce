import { NextResponse } from 'next/server';

export async function POST(request: any) {
  try {
    const { orderId, grossAmount, customerDetails, itemDetails } = await request.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      return NextResponse.json({ error: 'MIDTRANS_SERVER_KEY tidak ditemukan di .env.local' }, { status: 500 });
    }

    // Pastikan string key dibersihkan dari spasi/karakter tersembunyi
    const cleanServerKey = serverKey.trim();
    
    // Encode Base64 dengan titik dua di belakang key
    const authHeader = `Basic ${Buffer.from(`${cleanServerKey}:`).toString('base64')}`;

    console.log("Auth Header yang dikirim:", authHeader); // Cek terminal nanti

    const payload = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount,
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerDetails.fullName,
        email: customerDetails.email,
        phone: customerDetails.phone,
        shipping_address: {
          first_name: customerDetails.fullName,
          address: customerDetails.address,
          city: customerDetails.city,
          postal_code: customerDetails.postalCode,
        },
      },
    };

    const response = await fetch('https://app.sandbox.midtrans.com/snap/v1/transactions', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = Array.isArray(data.error_messages) 
        ? data.error_messages.join(', ') 
        : (data.message || JSON.stringify(data));
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    return NextResponse.json({ token: data.token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
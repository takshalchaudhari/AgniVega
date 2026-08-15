INSERT INTO public.crops (id,name,name_hi,name_mr,category,emoji,base_price,shelf_life_days,perishability,season,description) VALUES
('banana','Banana','केला','केळी','fruit','🍌',1850,7,'high','year-round','Jalgaon Grand Naine banana, high demand in northern markets.'),
('tomato','Tomato','टमाटर','टोमॅटो','vegetable','🍅',1400,5,'high','Rabi','Hybrid tomato, price swings sharply with arrivals.'),
('onion','Onion','प्याज','कांदा','vegetable','🧅',1650,60,'low','Rabi','Nashik red onion, storable and export grade.'),
('potato','Potato','आलू','बटाटा','vegetable','🥔',1250,45,'low','Rabi','Table potato suited for cold storage.'),
('grapes','Grapes','अंगूर','द्राक्षे','fruit','🍇',5200,10,'high','Winter','Thompson seedless, export quality from Nashik belt.'),
('pomegranate','Pomegranate','अनार','डाळिंब','fruit','🍎',7800,21,'medium','year-round','Bhagwa pomegranate, premium grade.'),
('mango','Mango','आम','आंबा','fruit','🥭',9500,8,'high','Summer','Alphonso from Konkan, seasonal peak in April-May.'),
('sugarcane','Sugarcane','गन्ना','ऊस','cash','🎋',315,3,'high','Winter','Delivered directly to sugar mills by weight.'),
('cotton','Cotton','कपास','कापूस','cash','🌿',7200,180,'low','Kharif','Long staple cotton for ginning units.'),
('soybean','Soybean','सोयाबीन','सोयाबीन','oilseed','🫘',4650,150,'low','Kharif','Oil-grade soybean from Vidarbha.'),
('wheat','Wheat','गेहूं','गहू','grain','🌾',2450,180,'low','Rabi','Sharbati wheat, mill grade.'),
('rice','Rice','चावल','तांदूळ','grain','🍚',3100,240,'low','Kharif','Indrayani paddy from Maval.'),
('jowar','Jowar','ज्वार','ज्वारी','grain','🌾',2900,150,'low','Rabi','Solapur jowar, staple grain.'),
('bajra','Bajra','बाजरा','बाजरी','grain','🌾',2550,150,'low','Kharif','Pearl millet.'),
('turmeric','Turmeric','हल्दी','हळद','spice','🟡',8200,300,'low','Rabi','Sangli turmeric, polished finger.'),
('chilli','Chilli','मिर्च','मिरची','spice','🌶️',11500,120,'medium','Kharif','Dry red chilli, Guntur type.'),
('groundnut','Groundnut','मूंगफली','भुईमूग','oilseed','🥜',6100,120,'low','Kharif','Bold groundnut for oil crushing.'),
('cabbage','Cabbage','पत्तागोभी','कोबी','vegetable','🥬',900,12,'medium','Rabi','Flat head cabbage.'),
('cauliflower','Cauliflower','फूलगोभी','फुलकोबी','vegetable','🥦',1150,7,'high','Rabi','Snowball cauliflower.'),
('okra','Okra','भिंडी','भेंडी','vegetable','🫑',2300,4,'high','Kharif','Tender ladyfinger, very perishable.'),
('brinjal','Brinjal','बैंगन','वांगी','vegetable','🍆',1450,6,'high','year-round','Purple long brinjal.'),
('green-peas','Green Peas','मटर','वाटाणा','vegetable','🟢',3400,6,'high','Rabi','Fresh shelling peas.'),
('orange','Orange','संतरा','संत्री','fruit','🍊',3800,14,'medium','Winter','Nagpur santra.'),
('sweet-lime','Sweet Lime','मौसंबी','मोसंबी','fruit','🍈',2600,12,'medium','year-round','Mosambi from Marathwada.');

INSERT INTO public.mandis (id,name,district,lat,lng,capacity_tons) VALUES
('apmc-pune','Pune APMC Market Yard','Pune',18.4682,73.8578,1200),
('apmc-nashik','Nashik APMC','Nashik',19.9975,73.7898,900),
('apmc-mumbai','Vashi APMC Mumbai','Thane',19.0760,73.0169,2000),
('apmc-nagpur','Nagpur Kalamna Market','Nagpur',21.1702,79.1400,800),
('apmc-jalgaon','Jalgaon Krishi Bazar','Jalgaon',21.0077,75.5626,600),
('apmc-solapur','Solapur Market Yard','Solapur',17.6599,75.9064,700),
('apmc-aurangabad','Chh. Sambhajinagar APMC','Aurangabad',19.8762,75.3433,650),
('apmc-kolhapur','Kolhapur Shetkari Bazar','Kolhapur',16.7050,74.2433,550);

INSERT INTO public.market_prices (crop_id, mandi_id, price_per_quintal, recorded_on, arrivals_tons)
SELECT c.id, m.id,
  ROUND((c.base_price * (0.88 + ((abs(hashtext(c.id||m.id)) % 25)::numeric / 100) + (d::numeric * 0.006)))::numeric, 0),
  current_date - d,
  ROUND((30 + (abs(hashtext(c.id||m.id||d::text)) % 220))::numeric, 0)
FROM public.crops c CROSS JOIN public.mandis m CROSS JOIN generate_series(0,13) d;

INSERT INTO public.weather_snapshots (district, temp_c, humidity, rain_mm, condition, spoilage_risk) VALUES
('Pune',31,58,0,'Sunny','low'),
('Nashik',29,64,2.4,'Light showers','medium'),
('Jalgaon',36,41,0,'Hot and dry','high'),
('Nagpur',34,47,0,'Clear','medium'),
('Solapur',33,44,0,'Clear','medium'),
('Aurangabad',32,52,0.6,'Partly cloudy','low'),
('Kolhapur',28,72,8.2,'Rain','high'),
('Thane',30,78,3.1,'Humid','high');

INSERT INTO public.fleets (id,owner_id,name,city,contact,rating,dataset) VALUES
('flt-sahyadri',NULL,'Sahyadri Logistics','Pune','+91 98220 11001',4.7,'demo'),
('flt-godavari',NULL,'Godavari Transport Co.','Nashik','+91 98220 11002',4.4,'demo'),
('flt-deccan',NULL,'Deccan Cold Chain','Solapur','+91 98220 11003',4.8,'demo');

INSERT INTO public.vehicles (id,fleet_id,reg_no,vehicle_type,capacity_tons,refrigerated,status,lat,lng,odometer_km,dataset) VALUES
('veh-01','flt-sahyadri','MH12 AB 4501','truck',12,false,'on_trip',18.5204,73.8567,142300,'demo'),
('veh-02','flt-sahyadri','MH12 AB 4502','truck',9,false,'on_trip',18.6100,73.9200,98700,'demo'),
('veh-03','flt-sahyadri','MH12 AB 4503','mini_truck',4,false,'available',18.4900,73.8100,54200,'demo'),
('veh-04','flt-godavari','MH15 CD 7701','truck',12,false,'on_trip',19.9975,73.7898,201400,'demo'),
('veh-05','flt-godavari','MH15 CD 7702','reefer',8,true,'available',19.9300,73.8300,76500,'demo'),
('veh-06','flt-godavari','MH15 CD 7703','mini_truck',3,false,'maintenance',19.9800,73.7600,120900,'demo'),
('veh-07','flt-deccan','MH13 EF 3301','reefer',10,true,'on_trip',17.6599,75.9064,88800,'demo'),
('veh-08','flt-deccan','MH13 EF 3302','truck',12,false,'available',17.6800,75.9300,164200,'demo'),
('veh-09','flt-deccan','MH13 EF 3303','tempo',2,false,'available',17.6500,75.8800,41100,'demo'),
('veh-10','flt-sahyadri','MH12 AB 4504','truck',11,false,'available',18.5400,73.8900,133700,'demo'),
('veh-11','flt-godavari','MH15 CD 7704','truck',10,false,'available',20.0100,73.7700,59400,'demo'),
('veh-12','flt-deccan','MH13 EF 3304','reefer',6,true,'on_trip',18.9000,74.5000,73200,'demo');

INSERT INTO public.drivers (id,user_id,fleet_id,vehicle_id,name,phone,license_no,license_expiry,verified,status,rating,total_trips,earnings,dataset) VALUES
('drv-01',NULL,'flt-sahyadri','veh-01','Ramesh Patil','+91 90000 10001','MH1220190001234','2028-04-12',true,'on_trip',4.8,412,684000,'demo'),
('drv-02',NULL,'flt-sahyadri','veh-02','Sunil Jadhav','+91 90000 10002','MH1220170004521','2027-09-30',true,'on_trip',4.6,318,512000,'demo'),
('drv-03',NULL,'flt-sahyadri','veh-03','Anil Shinde','+91 90000 10003','MH1220210007782','2029-01-15',true,'available',4.5,190,268000,'demo'),
('drv-04',NULL,'flt-godavari','veh-04','Vikram More','+91 90000 10004','MH1520160002210','2026-11-05',true,'on_trip',4.7,505,801000,'demo'),
('drv-05',NULL,'flt-godavari','veh-05','Sagar Pawar','+91 90000 10005','MH1520200005543','2028-07-21',true,'available',4.4,142,201000,'demo'),
('drv-06',NULL,'flt-godavari','veh-11','Nitin Bhosale','+91 90000 10006','MH1520180008834','2027-03-18',false,'off_duty',4.2,88,119000,'demo'),
('drv-07',NULL,'flt-deccan','veh-07','Imran Shaikh','+91 90000 10007','MH1320190003345','2028-12-01',true,'on_trip',4.9,377,640000,'demo'),
('drv-08',NULL,'flt-deccan','veh-08','Balu Kamble','+91 90000 10008','MH1320150001199','2026-08-09',true,'available',4.3,266,388000,'demo'),
('drv-09',NULL,'flt-deccan','veh-12','Prakash Gaikwad','+91 90000 10009','MH1320220009911','2029-05-30',true,'on_trip',4.6,131,182000,'demo'),
('drv-10',NULL,'flt-sahyadri','veh-10','Dattatray Kale','+91 90000 10010','MH1220200006677','2028-02-14',true,'available',4.5,224,331000,'demo');

INSERT INTO public.farms (id,owner_id,farmer_name,name,village,district,lat,lng,area_acres,dataset) VALUES
('frm-01',NULL,'Kisan Deshmukh','Deshmukh Wadi','Shirur','Pune',18.8270,74.3730,6.5,'demo'),
('frm-02',NULL,'Savita Jadhav','Jadhav Sheti','Niphad','Nashik',20.0800,74.1100,4.2,'demo'),
('frm-03',NULL,'Ganpat Chavan','Chavan Mala','Raver','Jalgaon',21.2490,76.0330,9.0,'demo'),
('frm-04',NULL,'Lata Pawar','Pawar Baug','Karmala','Solapur',18.4080,75.1930,3.8,'demo'),
('frm-05',NULL,'Bhau Sonawane','Sonawane Farms','Dindori','Nashik',20.2000,73.8300,7.4,'demo'),
('frm-06',NULL,'Rajendra Kadam','Kadam Krushi','Baramati','Pune',18.1514,74.5815,11.2,'demo'),
('frm-07',NULL,'Vaishali Patil','Patil Sheti','Paithan','Aurangabad',19.4760,75.3850,5.1,'demo'),
('frm-08',NULL,'Shankar Mane','Mane Wadi','Hatkanangale','Kolhapur',16.7800,74.4400,8.3,'demo');

INSERT INTO public.shipments (id,owner_id,farm_id,crop_id,mandi_id,quantity_tons,harvest_date,quality_grade,priority,pooled,status,distance_km,eta_minutes,transport_cost,pool_savings,expected_amount,payment_status,dataset) VALUES
('shp-01',NULL,'frm-03','banana','apmc-mumbai',18,current_date-1,'A','high',true,'in_transit',412,486,58400,12600,331200,'held','demo'),
('shp-02',NULL,'frm-02','onion','apmc-pune',11,current_date-2,'A','normal',false,'in_transit',210,264,24800,0,180500,'held','demo'),
('shp-03',NULL,'frm-01','tomato','apmc-pune',4.5,current_date,'B','urgent',false,'allocated',72,96,9600,0,62100,'pending','demo'),
('shp-04',NULL,'frm-05','grapes','apmc-mumbai',9,current_date-1,'A','high',false,'delivered',178,214,31500,0,466200,'paid','demo'),
('shp-05',NULL,'frm-06','sugarcane','apmc-solapur',22,current_date-3,'B','normal',true,'delivered',148,196,26400,7100,68200,'paid','demo'),
('shp-06',NULL,'frm-04','pomegranate','apmc-mumbai',6,current_date,'A','high',false,'created',392,462,42800,0,467000,'pending','demo'),
('shp-07',NULL,'frm-07','cotton','apmc-nagpur',14,current_date-4,'A','normal',true,'completed',412,498,49200,11400,1006000,'paid','demo'),
('shp-08',NULL,'frm-08','sweet-lime','apmc-kolhapur',5.5,current_date-1,'B','normal',false,'in_transit',48,66,7200,0,142100,'held','demo'),
('shp-09',NULL,'frm-01','wheat','apmc-pune',12,current_date-5,'A','low',false,'completed',68,88,11800,0,293000,'paid','demo'),
('shp-10',NULL,'frm-02','potato','apmc-nashik',8,current_date-2,'A','normal',true,'allocated',36,52,5400,1800,99400,'pending','demo');

INSERT INTO public.quality_reports (shipment_id,grade,moisture_pct,notes,verified,dataset) VALUES
('shp-01','A',68,'Uniform ripeness, no bruising observed.',true,'demo'),
('shp-02','A',12,'Well cured, single skin loss under 3%.',true,'demo'),
('shp-03','B',92,'Some cracking due to late rain.',false,'demo'),
('shp-04','A',80,'Export grade bunches, sorted.',true,'demo'),
('shp-06','A',82,'Bhagwa, average 280g per fruit.',false,'demo');

INSERT INTO public.trips (id,shipment_id,vehicle_id,driver_id,status,load_tons,distance_km,eta_minutes,payout,progress,started_at,dataset) VALUES
('trp-01','shp-01','veh-01','drv-01','IN_TRANSIT',12,412,486,29400,0.62,now()-interval '5 hours','demo'),
('trp-02','shp-01','veh-02','drv-02','IN_TRANSIT',6,412,486,17600,0.58,now()-interval '5 hours','demo'),
('trp-03','shp-02','veh-04','drv-04','ARRIVED_DESTINATION',11,210,264,15200,0.96,now()-interval '4 hours','demo'),
('trp-04','shp-04','veh-07','drv-07','DELIVERED',9,178,214,14100,1,now()-interval '9 hours','demo'),
('trp-05','shp-05','veh-12','drv-09','COMPLETED',11,148,196,11700,1,now()-interval '2 days','demo'),
('trp-06','shp-08','veh-12','drv-09','LOADING',5.5,48,66,4300,0.15,now()-interval '40 minutes','demo'),
('trp-07','shp-03',NULL,NULL,'OFFERED',4.5,72,96,6200,0,NULL,'demo'),
('trp-08','shp-06',NULL,NULL,'OFFERED',6,392,462,27800,0,NULL,'demo'),
('trp-09','shp-10',NULL,NULL,'OFFERED',8,36,52,3900,0,NULL,'demo');

INSERT INTO public.trip_events (trip_id,status,note,dataset) VALUES
('trp-01','ACCEPTED','Driver accepted the trip','demo'),
('trp-01','EN_ROUTE_PICKUP','Heading to Raver, Jalgaon','demo'),
('trp-01','ARRIVED_PICKUP','Arrived at Chavan Mala','demo'),
('trp-01','LOADING','12 t banana loaded','demo'),
('trp-01','IN_TRANSIT','On NH-160 towards Vashi','demo'),
('trp-03','IN_TRANSIT','Crossing Sinnar','demo'),
('trp-03','ARRIVED_DESTINATION','At Pune APMC gate 4','demo'),
('trp-04','DELIVERED','Unloaded 9 t grapes','demo'),
('trp-05','COMPLETED','Trip settled','demo'),
('trp-06','LOADING','Loading sweet lime crates','demo');

INSERT INTO public.gps_pings (trip_id, vehicle_id, lat, lng, speed_kmph, idempotency_key, dataset, recorded_at)
SELECT t.id, t.vehicle_id,
  21.2490 + (18.9 - 21.2490) * (g::numeric/20) + ((abs(hashtext(t.id||g::text)) % 20) - 10)::numeric/2000,
  76.0330 + (73.02 - 76.0330) * (g::numeric/20),
  38 + (abs(hashtext(t.id||g::text)) % 26),
  t.id||'-'||g, 'demo', now() - ((20-g) * interval '12 minutes')
FROM public.trips t CROSS JOIN generate_series(0,20) g
WHERE t.vehicle_id IS NOT NULL;

INSERT INTO public.listings (id,shipment_id,crop_id,farm_id,mandi_id,quantity_tons,price_per_quintal,grade,dataset) VALUES
('lst-01','shp-01','banana','frm-03','apmc-mumbai',18,1920,'A','demo'),
('lst-02','shp-02','onion','frm-02','apmc-pune',11,1710,'A','demo'),
('lst-03','shp-03','tomato','frm-01','apmc-pune',4.5,1380,'B','demo'),
('lst-04','shp-06','pomegranate','frm-04','apmc-mumbai',6,7950,'A','demo'),
('lst-05','shp-10','potato','frm-02','apmc-nashik',8,1240,'A','demo'),
('lst-06',NULL,'grapes','frm-05','apmc-mumbai',7,5350,'A','demo'),
('lst-07',NULL,'wheat','frm-01','apmc-pune',15,2480,'A','demo'),
('lst-08',NULL,'orange','frm-07','apmc-nagpur',10,3860,'A','demo'),
('lst-09',NULL,'chilli','frm-06','apmc-solapur',3,11800,'A','demo'),
('lst-10',NULL,'sweet-lime','frm-08','apmc-kolhapur',5.5,2640,'B','demo');

INSERT INTO public.orders (id,buyer_id,buyer_name,listing_id,crop_id,quantity_tons,total_amount,status,dataset,created_at) VALUES
('ord-01',NULL,'Shree Traders','lst-06','grapes',2,107000,'delivered','demo',now()-interval '3 days'),
('ord-02',NULL,'Mumbai Fresh Mart','lst-01','banana',4,76800,'in_transit','demo',now()-interval '1 day'),
('ord-03',NULL,'Deccan Foods Pvt Ltd','lst-07','wheat',5,124000,'confirmed','demo',now()-interval '6 hours');

UPDATE public.listings SET quantity_tons = quantity_tons - 4 WHERE id = 'lst-01';
UPDATE public.listings SET quantity_tons = quantity_tons - 2 WHERE id = 'lst-06';
UPDATE public.listings SET quantity_tons = quantity_tons - 5 WHERE id = 'lst-07';

INSERT INTO public.maintenance (vehicle_id,kind,status,cost,notes,dataset) VALUES
('veh-06','Clutch overhaul','in_progress',18500,'Workshop: Nashik service centre','demo'),
('veh-04','Tyre rotation','open',6200,'Due at 205000 km','demo'),
('veh-01','Engine service','closed',14300,'Completed last week','demo'),
('veh-08','Brake pads','open',4800,'Front axle','demo');

INSERT INTO public.incidents (kind,severity,status,trip_id,reporter_role,description,dataset) VALUES
('SOS','high','open','trp-01','driver','Driver reported chest pain near Nashik bypass.','demo'),
('BREAKDOWN','medium','investigating','trp-06','driver','Coolant leak, vehicle stopped for 20 minutes.','demo'),
('DELAY','low','resolved','trp-03','driver','Held at APMC gate for 45 minutes.','demo');

INSERT INTO public.support_tickets (user_id,role,subject,body,status,dataset) VALUES
(NULL,'farmer','Payment not received for shipment shp-05','Delivery completed two days ago.','open','demo'),
(NULL,'driver','Fuel card not working','Card declined at Solapur pump.','in_progress','demo'),
(NULL,'buyer','Need invoice for order ord-01','GST invoice required.','resolved','demo'),
(NULL,'fleet','Add second driver to MH15 CD 7704','Requesting driver assignment.','open','demo');

INSERT INTO public.notifications (user_id,role,title,body,read,dataset) VALUES
(NULL,'farmer','Vehicle allocated','2 vehicles assigned to your banana shipment.',false,'demo'),
(NULL,'farmer','Price alert','Onion price at Pune APMC rose 6% today.',false,'demo'),
(NULL,'driver','New trip available','Tomato 4.5 t, Shirur to Pune APMC, ₹6,200.',false,'demo'),
(NULL,'fleet','Maintenance due','MH15 CD 7701 tyre rotation due.',false,'demo'),
(NULL,'buyer','Order shipped','Banana order ord-02 is in transit.',false,'demo'),
(NULL,'admin','SOS raised','Driver Ramesh Patil raised an SOS on trip trp-01.',false,'demo');

INSERT INTO public.transactions (user_id,role,kind,amount,note,dataset) VALUES
(NULL,'farmer','credit',466200,'Grapes sale settled - shp-04','demo'),
(NULL,'farmer','debit',31500,'Transport cost - shp-04','demo'),
(NULL,'farmer','credit',293000,'Wheat sale settled - shp-09','demo'),
(NULL,'driver','credit',14100,'Trip payout trp-04','demo'),
(NULL,'driver','credit',11700,'Trip payout trp-05','demo'),
(NULL,'buyer','debit',107000,'Order ord-01','demo');

INSERT INTO public.audit_logs (actor,action,entity,detail,dataset) VALUES
('system','seed.load','database','Demo dataset seeded','demo'),
('admin','mode.set','system_state','Mode set to real','demo'),
('drv-01','trip.status','trp-01','IN_TRANSIT','demo'),
('frm-03','shipment.create','shp-01','18 t banana to Vashi APMC','demo');
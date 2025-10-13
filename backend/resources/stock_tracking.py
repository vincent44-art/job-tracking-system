from flask_restful import Resource, reqparse
from backend.extensions import db
from backend.models.stock_tracking import StockTracking
from backend.models.sales import Sale
from backend.models.other_expense import OtherExpense
from backend.models.driver import DriverExpense
from backend.models.stock_movement import StockMovement
from backend.models.inventory import Inventory
from backend.models.purchases import Purchase
from ..utils.helpers import make_response_data
from ..utils.decorators import role_required
from datetime import datetime, timedelta
from flask import send_file, make_response
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.units import inch
import io
import logging

parser = reqparse.RequestParser()
parser.add_argument('stockName', type=str, required=True)
parser.add_argument('dateIn', type=str, required=True)
parser.add_argument('fruitType', type=str, required=True)
parser.add_argument('quantityIn', type=float, required=True)
parser.add_argument('amountPerKg', type=float, required=False, default=0)
parser.add_argument('totalAmount', type=float, required=False, default=0)
parser.add_argument('otherCharges', type=float, default=0)
parser.add_argument('dateOut', type=str)
parser.add_argument('duration', type=int)
parser.add_argument('gradientUsed', type=str)
parser.add_argument('gradientAmountUsed', type=float)
parser.add_argument('gradientCostPerUnit', type=float)
parser.add_argument('totalGradientCost', type=float)
parser.add_argument('quantityOut', type=float)
parser.add_argument('spoilage', type=float)
parser.add_argument('totalStockCost', type=float)

class StockTrackingListResource(Resource):
    @role_required('storekeeper', 'ceo', 'seller', 'purchaser', 'driver', 'admin', 'it')
    def get(self):
        # Get all records and group by stock_name and date_out
        records = StockTracking.query.order_by(StockTracking.date_in.desc()).all()

        # Group records by stock_name and date_out combination
        grouped_records = {}
        for record in records:
            # Create a key combining stock_name and date_out (or 'pending' if no date_out)
            key = f"{record.stock_name}_{record.date_out.isoformat() if record.date_out else 'pending'}"
            if key not in grouped_records:
                grouped_records[key] = []
            grouped_records[key].append(record)

        # Aggregate records in each group
        aggregated_data = []
        for key, group_records in grouped_records.items():
            if len(group_records) == 1:
                # Single record, use as is
                aggregated_data.append(group_records[0].to_dict())
            else:
                # Multiple records for same stock and date_out, aggregate them
                first_record = group_records[0]

                # Sum quantities and amounts
                total_quantity_in = sum(r.quantity_in for r in group_records)
                total_quantity_out = sum(r.quantity_out or 0 for r in group_records)
                total_amount = sum(r.total_amount for r in group_records)
                total_other_charges = sum(r.other_charges for r in group_records)
                total_gradient_cost = sum(r.total_gradient_cost or 0 for r in group_records)
                total_spoilage = sum(r.spoilage or 0 for r in group_records)
                total_stock_cost = sum(r.total_stock_cost or 0 for r in group_records)

                # Create aggregated record
                aggregated_record = {
                    'id': first_record.id,  # Use first record's ID for PDF generation
                    'stockName': first_record.stock_name,
                    'dateIn': first_record.date_in.isoformat() if first_record.date_in else None,
                    'fruitType': first_record.fruit_type,  # Will be overridden in PDF with detailed sales
                    'quantityIn': total_quantity_in,
                    'amountPerKg': first_record.amount_per_kg,  # Keep original for reference
                    'totalAmount': total_amount,
                    'otherCharges': total_other_charges,
                    'dateOut': first_record.date_out.isoformat() if first_record.date_out else None,
                    'duration': first_record.duration,
                    'gradientUsed': first_record.gradient_used,
                    'gradientAmountUsed': sum(r.gradient_amount_used or 0 for r in group_records),
                    'gradientCostPerUnit': first_record.gradient_cost_per_unit,
                    'totalGradientCost': total_gradient_cost,
                    'quantityOut': total_quantity_out if total_quantity_out > 0 else None,
                    'spoilage': total_spoilage if total_spoilage > 0 else None,
                    'totalStockCost': total_stock_cost if total_stock_cost > 0 else None,
                    'isAggregated': True,  # Flag to indicate this is an aggregated record
                    'originalRecords': [r.id for r in group_records]  # Store original record IDs
                }
                aggregated_data.append(aggregated_record)

        # Sort by date_in descending
        aggregated_data.sort(key=lambda x: x.get('dateIn', ''), reverse=True)

        return make_response_data(data=aggregated_data, message="Stock tracking records fetched.")

    @role_required('storekeeper', 'ceo')
    def post(self):
        data = parser.parse_args()
        try:
            # Automatically set date_in to today if not provided or invalid
            if not data.get('dateIn'):
                date_in = datetime.now().date()
            else:
                try:
                    date_in = datetime.strptime(data['dateIn'], '%Y-%m-%d').date()
                except ValueError:
                    date_in = datetime.now().date()

            # Automatically set date_out to None if not provided or invalid
            if not data.get('dateOut'):
                date_out = None
            else:
                try:
                    date_out = datetime.strptime(data['dateOut'], '%Y-%m-%d').date()
                except ValueError:
                    date_out = None

        except Exception as e:
            return make_response_data(success=False, message=f"Invalid date format or error: {str(e)}", status_code=400)

        record = StockTracking(
            stock_name=data['stockName'],
            date_in=date_in,
            fruit_type=data['fruitType'],
            quantity_in=data['quantityIn'],
            amount_per_kg=data['amountPerKg'],
            total_amount=data['totalAmount'],
            other_charges=data.get('otherCharges', 0),
            date_out=date_out,
            duration=data.get('duration'),
            gradient_used=data.get('gradientUsed'),
            gradient_amount_used=data.get('gradientAmountUsed'),
            gradient_cost_per_unit=data.get('gradientCostPerUnit'),
            total_gradient_cost=data.get('totalGradientCost'),
            quantity_out=data.get('quantityOut'),
            spoilage=data.get('spoilage'),
            total_stock_cost=data.get('totalStockCost'),
        )
        db.session.add(record)
        db.session.commit()
        return make_response_data(data=record.to_dict(), message="Stock tracking record created.", status_code=201)

class ClearStockTrackingResource(Resource):
    @role_required('ceo')
    def delete(self):
        num_deleted = StockTracking.query.delete()
        db.session.commit()
        return make_response_data(message=f"Successfully cleared {num_deleted} stock tracking records.")


def generate_stock_pdf(stock_record):
    """Generate PDF for a stock tracking record"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=16,
        spaceAfter=30,
        alignment=1,  # Center alignment
    )

    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontSize=12,
        spaceAfter=10,
        textColor=colors.darkblue,
    )

    content_style = styles['Normal']

    # Build PDF content
    elements = []

    # Title
    elements.append(Paragraph(f"Stock Tracking Report - {stock_record.stock_name}", title_style))
    elements.append(Spacer(1, 12))

    # Get all original records if this is an aggregated record
    original_records = []
    if hasattr(stock_record, 'isAggregated') and stock_record.isAggregated:
        # This is an aggregated record, get all original records
        original_record_ids = getattr(stock_record, 'originalRecords', [])
        original_records = StockTracking.query.filter(StockTracking.id.in_(original_record_ids)).all()
    else:
        # Single record
        original_records = [stock_record]

    # Basic Information Section
    elements.append(Paragraph("Basic Information", section_style))
    elements.append(Spacer(1, 6))

    basic_data = [
        ['Stock Name', stock_record.stock_name],
        ['Date In', stock_record.date_in.strftime('%Y-%m-%d') if stock_record.date_in else 'N/A'],
        ['Date Out', stock_record.date_out.strftime('%Y-%m-%d') if stock_record.date_out else 'N/A'],
        ['Duration (days)', str(stock_record.duration) if stock_record.duration else 'N/A'],
    ]

    basic_table = Table(basic_data, colWidths=[2*inch, 3*inch])
    basic_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(basic_table)
    elements.append(Spacer(1, 20))

    # Fruits Sold Section - Show detailed breakdown of each fruit type sold
    elements.append(Paragraph("Fruits Sold Details", section_style))
    elements.append(Spacer(1, 6))

    fruit_sales_data = [['Fruit Type', 'Quantity Sold', 'Amount per Kg', 'Total Amount']]
    total_quantity_sold = 0
    total_revenue = 0

    for record in original_records:
        if record.quantity_out and record.quantity_out > 0:
            fruit_sales_data.append([
                record.fruit_type,
                f"{record.quantity_out} units",
                f"KES {record.amount_per_kg:.2f}",
                f"KES {(record.quantity_out * record.amount_per_kg):.2f}"
            ])
            total_quantity_sold += record.quantity_out
            total_revenue += record.quantity_out * record.amount_per_kg

    # Add totals row
    fruit_sales_data.append([
        'TOTAL',
        f"{total_quantity_sold} units",
        '',
        f"KES {total_revenue:.2f}"
    ])

    fruit_table = Table(fruit_sales_data, colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
    fruit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightgreen),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -2), colors.beige),
        ('BACKGROUND', (-1, -1), (-1, -1), colors.lightblue),  # Total row
        ('FONTNAME', (-1, -1), (-1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(fruit_table)
    elements.append(Spacer(1, 20))

    # Quantity and Pricing Section
    elements.append(Paragraph("Stock Summary", section_style))
    elements.append(Spacer(1, 6))

    quantity_data = [
        ['Total Quantity In', f"{stock_record.quantity_in} units"],
        ['Total Quantity Out', f"{total_quantity_sold} units"],
        ['Spoilage', f"{stock_record.spoilage or 0} units"],
        ['Total Revenue', f"KES {total_revenue:.2f}"],
        ['Total Cost', f"KES {stock_record.total_amount:.2f}"],
        ['Other Charges', f"KES {stock_record.other_charges:.2f}"],
    ]

    quantity_table = Table(quantity_data, colWidths=[2*inch, 2.5*inch])
    quantity_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(quantity_table)
    elements.append(Spacer(1, 20))

    # Gradient Information Section (if applicable)
    if stock_record.gradient_used:
        elements.append(Paragraph("Gradient Information", section_style))
        elements.append(Spacer(1, 6))

        gradient_data = [
            ['Gradient Used', stock_record.gradient_used],
            ['Gradient Amount Used', f"{stock_record.gradient_amount_used or 0} units"],
            ['Gradient Cost per Unit', f"KES {stock_record.gradient_cost_per_unit or 0:.2f}"],
            ['Total Gradient Cost', f"KES {stock_record.total_gradient_cost or 0:.2f}"],
        ]

        gradient_table = Table(gradient_data, colWidths=[2*inch, 2.5*inch])
        gradient_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(gradient_table)
        elements.append(Spacer(1, 20))

    # Profit/Loss Section
    elements.append(Paragraph("Profit/Loss Summary", section_style))
    elements.append(Spacer(1, 6))

    total_costs = (stock_record.total_amount + stock_record.other_charges + (stock_record.total_gradient_cost or 0))
    profit_loss = total_revenue - total_costs

    profit_data = [
        ['Total Revenue', f"KES {total_revenue:.2f}"],
        ['Total Costs', f"KES {total_costs:.2f}"],
        ['Profit/Loss', f"KES {profit_loss:.2f}"],
    ]

    profit_table = Table(profit_data, colWidths=[2*inch, 2.5*inch])
    profit_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(profit_table)

    # Footer
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("Generated on: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S'), styles['Italic']))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer


class StockTrackingPDFResource(Resource):
    @role_required('storekeeper', 'ceo', 'seller', 'purchaser', 'driver', 'admin', 'it')
    def get(self, record_id):
        try:
            record = StockTracking.query.get_or_404(record_id)
            pdf_buffer = generate_stock_pdf(record)

            response = make_response(pdf_buffer.getvalue())
            response.headers['Content-Type'] = 'application/pdf'
            response.headers['Content-Disposition'] = f'attachment; filename=stock_report_{record.stock_name}_{record.id}.pdf'

            return response
        except Exception as e:
            return make_response_data(success=False, message=f"Error generating PDF: {str(e)}", status_code=500)


class StockTrackingAggregatedResource(Resource):
    @role_required('storekeeper', 'ceo', 'seller', 'purchaser', 'driver', 'admin', 'it')
    def get(self):
        try:
            # Set up logging
            logger = logging.getLogger('stock_tracking')
            logger.info("Fetching aggregated stock tracking data")

            # Get all stock tracking records
            stocks = StockTracking.query.all()
            logger.info(f"Found {len(stocks)} stock tracking records")

            # Group stocks by stock_name
            stock_groups = {}
            for stock in stocks:
                name = stock.stock_name
                if name not in stock_groups:
                    stock_groups[name] = []
                stock_groups[name].append(stock)

            aggregated_data = []

            for stock_name, stock_list in stock_groups.items():
                try:
                    # Aggregate basic info
                    fruit_type = stock_list[0].fruit_type  # Assume same for group
                    total_purchase_cost = sum(stock.total_amount for stock in stock_list)
                    total_quantity_in = sum(stock.quantity_in for stock in stock_list)
                    earliest_date_in = min((stock.date_in for stock in stock_list if stock.date_in), default=None)
                    latest_date_out = max((stock.date_out for stock in stock_list if stock.date_out), default=None)

                    # Calculate storage usage from stock movements (sum for all stocks in group)
                    storage_usage = 0
                    try:
                        storage_result = StockMovement.query.join(Inventory).filter(
                            Inventory.name == stock_name,
                            StockMovement.movement_type == 'out'
                        ).with_entities(db.func.sum(StockMovement.quantity)).scalar()
                        storage_usage = float(storage_result) if storage_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating storage usage for stock {stock_name}: {str(e)}")
                        storage_usage = 0

                    # Calculate transport costs from driver expenses (sum for group)
                    transport_costs = 0
                    try:
                        transport_result = DriverExpense.query.filter(
                            DriverExpense.stock_name == stock_name
                        ).with_entities(db.func.sum(DriverExpense.amount)).scalar()
                        transport_costs = float(transport_result) if transport_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating transport costs for stock {stock_name}: {str(e)}")
                        transport_costs = 0

                    # Calculate other expenses (link by date range - 7 days before/after group dates)
                    other_expenses = 0
                    try:
                        if earliest_date_in or latest_date_out:
                            stock_date = earliest_date_in or latest_date_out or datetime.now().date()
                            date_start = stock_date - timedelta(days=7)
                            date_end = (latest_date_out or stock_date) + timedelta(days=7)
                        else:
                            # If no dates, use a wide range or skip
                            date_start = datetime.now().date() - timedelta(days=30)
                            date_end = datetime.now().date() + timedelta(days=30)

                        expense_result = OtherExpense.query.filter(
                            OtherExpense.date >= date_start,
                            OtherExpense.date <= date_end
                        ).with_entities(db.func.sum(OtherExpense.amount)).scalar()
                        other_expenses = float(expense_result) if expense_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating other expenses for stock {stock_name}: {str(e)}")
                        other_expenses = 0

                    # Calculate revenue and quantity sold from sales (sum for fruit_type from date_start to now)
                    revenue = 0
                    quantity_sold = 0
                    try:
                        date_start = earliest_date_in or datetime.now().date() - timedelta(days=365)
                        date_end = datetime.now().date()  # Include all sales up to current date
                        sales_query = Sale.query.filter(
                            Sale.fruit_name == fruit_type,
                            Sale.date >= date_start,
                            Sale.date <= date_end
                        )
                        revenue_result = sales_query.with_entities(db.func.sum(Sale.amount)).scalar()
                        quantity_result = sales_query.with_entities(db.func.sum(Sale.qty)).scalar()
                        revenue = float(revenue_result) if revenue_result else 0
                        quantity_sold = float(quantity_result) if quantity_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating revenue and quantity sold for stock {stock_name}: {str(e)}")
                        revenue = 0
                        quantity_sold = 0

                    # Calculate profit/loss
                    total_costs = total_purchase_cost + transport_costs + other_expenses
                    profit_loss = revenue - total_costs

                    aggregated_data.append({
                        'stock_name': stock_name,
                        'fruit_type': fruit_type,
                        'purchase_cost': total_purchase_cost,
                        'storage_usage': storage_usage,
                        'transport_costs': transport_costs,
                        'other_expenses': other_expenses,
                        'revenue': revenue,
                        'quantity_sold': quantity_sold,
                        'profit_loss': profit_loss,
                        'date_in': earliest_date_in.isoformat() if earliest_date_in else None,
                        'date_out': latest_date_out.isoformat() if latest_date_out else None,
                        'total_quantity_in': total_quantity_in
                    })

                except Exception as e:
                    logger.error(f"Error processing stock group {stock_name}: {str(e)}")
                    continue

            # Also calculate fruit profitability summary from purchases and sales
            fruit_profitability = {}
            purchases = Purchase.query.all()
            sales = Sale.query.all()

            # Aggregate purchases
            for purchase in purchases:
                try:
                    fruit = purchase.fruit_type
                    if fruit not in fruit_profitability:
                        fruit_profitability[fruit] = {
                            'fruit_name': fruit,
                            'total_purchased': 0,
                            'total_sold': 0,
                            'total_revenue': 0,
                            'total_costs': 0
                        }

                    # Parse quantity, handling strings with units
                    quantity_str = str(purchase.quantity).strip()
                    # Extract numeric part
                    import re
                    quantity_match = re.search(r'(\d+(\.\d+)?)', quantity_str)
                    quantity = float(quantity_match.group(1)) if quantity_match else 0.0

                    fruit_profitability[fruit]['total_purchased'] += quantity
                    fruit_profitability[fruit]['total_costs'] += float(purchase.cost or 0)

                except Exception as e:
                    logger.error(f"Error processing purchase for fruit {purchase.fruit_type}: {str(e)}")
                    continue

            # Aggregate sales (from sales table and seller_fruits table)
            from backend.models.seller_fruit import SellerFruit
            sales_records = sales + SellerFruit.query.all()
            for sale in sales_records:
                try:
                    fruit = sale.fruit_name
                    if fruit not in fruit_profitability:
                        fruit_profitability[fruit] = {
                            'fruit_name': fruit,
                            'total_purchased': 0,
                            'total_sold': 0,
                            'total_revenue': 0,
                            'total_costs': 0
                        }

                    fruit_profitability[fruit]['total_sold'] += float(sale.qty)
                    fruit_profitability[fruit]['total_revenue'] += sale.amount

                except Exception as e:
                    logger.error(f"Error processing sale for fruit {sale.fruit_name}: {str(e)}")
                    continue

            # Calculate profit margin for each fruit
            for fruit_data in fruit_profitability.values():
                fruit_data['profit_margin'] = fruit_data['total_revenue'] - fruit_data['total_costs']

            logger.info(f"Successfully processed {len(aggregated_data)} stock records and {len(fruit_profitability)} fruit types")

            return make_response_data(
                data={
                    'stock_expenses': aggregated_data,
                    'fruit_profitability': list(fruit_profitability.values())
                },
                message="Aggregated stock tracking data fetched successfully."
            )

        except Exception as e:
            logger = logging.getLogger('stock_tracking')
            logger.error(f"Error fetching aggregated data: {str(e)}")
            return make_response_data(success=False, message=f"Error fetching aggregated data: {str(e)}", status_code=500)

from flask_restful import Resource, reqparse
from backend.extensions import db
from backend.models.stock_tracking import StockTracking
from backend.models.sales import Sale
from backend.models.other_expense import OtherExpense
from backend.models.driver import DriverExpense
from backend.models.stock_movement import StockMovement
from backend.models.inventory import Inventory
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
parser.add_argument('amountPerKg', type=float, required=True)
parser.add_argument('totalAmount', type=float, required=True)
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
        records = StockTracking.query.order_by(StockTracking.date_in.desc()).all()
        return make_response_data(data=[r.to_dict() for r in records], message="Stock tracking records fetched.")

    @role_required('storekeeper', 'ceo')
    def post(self):
        data = parser.parse_args()
        try:
            date_in = datetime.strptime(data['dateIn'], '%Y-%m-%d').date()
            date_out = datetime.strptime(data['dateOut'], '%Y-%m-%d').date() if data.get('dateOut') else None
        except ValueError:
            return make_response_data(success=False, message="Invalid date format. Use YYYY-MM-DD.", status_code=400)
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

    # Basic Information Section
    elements.append(Paragraph("Basic Information", section_style))
    elements.append(Spacer(1, 6))

    basic_data = [
        ['Stock Name', stock_record.stock_name],
        ['Fruit Type', stock_record.fruit_type],
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

    # Quantity and Pricing Section
    elements.append(Paragraph("Quantity and Pricing", section_style))
    elements.append(Spacer(1, 6))

    quantity_data = [
        ['Quantity In', f"{stock_record.quantity_in} units"],
        ['Quantity Out', f"{stock_record.quantity_out or 0} units"],
        ['Spoilage', f"{stock_record.spoilage or 0} units"],
        ['Amount per Kg', f"KES {stock_record.amount_per_kg:.2f}"],
        ['Total Amount', f"KES {stock_record.total_amount:.2f}"],
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

    # Total Cost Section
    elements.append(Paragraph("Cost Summary", section_style))
    elements.append(Spacer(1, 6))

    cost_data = [
        ['Total Stock Cost', f"KES {stock_record.total_stock_cost:.2f}"],
    ]

    cost_table = Table(cost_data, colWidths=[2*inch, 2.5*inch])
    cost_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkgreen),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.lightgreen),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    elements.append(cost_table)

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

            aggregated_data = []

            for stock in stocks:
                try:
                    # Calculate storage usage from stock movements
                    storage_usage = 0
                    try:
                        storage_result = StockMovement.query.join(Inventory).filter(
                            Inventory.name == stock.stock_name,
                            StockMovement.movement_type == 'out'
                        ).with_entities(db.func.sum(StockMovement.quantity)).scalar()
                        storage_usage = float(storage_result) if storage_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating storage usage for stock {stock.stock_name}: {str(e)}")
                        storage_usage = 0

                    # Calculate transport costs from driver expenses
                    transport_costs = 0
                    try:
                        transport_result = DriverExpense.query.filter(
                            DriverExpense.stock_name == stock.stock_name
                        ).with_entities(db.func.sum(DriverExpense.amount)).scalar()
                        transport_costs = float(transport_result) if transport_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating transport costs for stock {stock.stock_name}: {str(e)}")
                        transport_costs = 0

                    # Calculate other expenses (link by date range - 7 days before/after stock date)
                    other_expenses = 0
                    try:
                        stock_date = stock.date_in or stock.date_out or datetime.now().date()
                        date_start = stock_date - timedelta(days=7)
                        date_end = stock_date + timedelta(days=7)

                        expense_result = OtherExpense.query.filter(
                            OtherExpense.date >= date_start,
                            OtherExpense.date <= date_end
                        ).with_entities(db.func.sum(OtherExpense.amount)).scalar()
                        other_expenses = float(expense_result) if expense_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating other expenses for stock {stock.stock_name}: {str(e)}")
                        other_expenses = 0

                    # Calculate revenue from sales
                    revenue = 0
                    try:
                        revenue_result = Sale.query.filter(
                            Sale.fruit_name == stock.fruit_type,
                            Sale.date >= stock.date_in,
                            Sale.date <= (stock.date_out or datetime.now().date())
                        ).with_entities(db.func.sum(Sale.amount)).scalar()
                        revenue = float(revenue_result) if revenue_result else 0
                    except Exception as e:
                        logger.warning(f"Error calculating revenue for stock {stock.stock_name}: {str(e)}")
                        revenue = 0

                    # Calculate profit/loss
                    total_costs = stock.total_amount + transport_costs + other_expenses
                    profit_loss = revenue - total_costs

                    aggregated_data.append({
                        'stock_id': stock.id,
                        'stock_name': stock.stock_name,
                        'fruit_type': stock.fruit_type,
                        'purchase_cost': stock.total_amount,
                        'storage_usage': storage_usage,
                        'transport_costs': transport_costs,
                        'other_expenses': other_expenses,
                        'revenue': revenue,
                        'profit_loss': profit_loss,
                        'date_in': stock.date_in.isoformat() if stock.date_in else None,
                        'date_out': stock.date_out.isoformat() if stock.date_out else None
                    })

                except Exception as e:
                    logger.error(f"Error processing stock {stock.stock_name}: {str(e)}")
                    continue

            # Also calculate fruit profitability summary
            fruit_profitability = {}
            for stock in stocks:
                try:
                    fruit = stock.fruit_type
                    if fruit not in fruit_profitability:
                        fruit_profitability[fruit] = {
                            'fruit_name': fruit,
                            'total_purchased': 0,
                            'total_sold': 0,
                            'total_revenue': 0,
                            'total_costs': 0
                        }

                    fruit_profitability[fruit]['total_purchased'] += stock.quantity_in
                    fruit_profitability[fruit]['total_costs'] += stock.total_amount

                    # Get sales for this fruit
                    try:
                        sales = Sale.query.filter(
                            Sale.fruit_name == fruit,
                            Sale.date >= stock.date_in,
                            Sale.date <= (stock.date_out or datetime.now().date())
                        ).all()

                        for sale in sales:
                            fruit_profitability[fruit]['total_sold'] += float(sale.qty)
                            fruit_profitability[fruit]['total_revenue'] += sale.amount
                    except Exception as e:
                        logger.warning(f"Error fetching sales for fruit {fruit}: {str(e)}")

                except Exception as e:
                    logger.error(f"Error processing fruit profitability for {stock.fruit_type}: {str(e)}")
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

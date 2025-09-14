from flask_restful import Resource, reqparse
from datetime import datetime
from sqlalchemy import func
from backend.extensions import db
from backend.models.sales import Sale
from backend.models.user import UserRole
from ..utils.helpers import make_response_data, get_current_user
from ..utils.decorators import role_required
from flask import send_file
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
import io

parser = reqparse.RequestParser()
parser.add_argument('assignment', type=str, required=True)
parser.add_argument('fruit_type', type=str, required=True)
parser.add_argument('quantity', type=str, required=True)
parser.add_argument('revenue', type=float, required=True)
parser.add_argument('sale_date', type=str, required=True)

class SalesListResource(Resource):
    @role_required('ceo', 'seller')
    def get(self):
        current_user = get_current_user()

        if current_user.role == UserRole.CEO:
            sales = Sale.query.order_by(Sale.sale_date.desc()).all()
        else: # Seller
            sales = Sale.query.filter_by(seller_id=current_user.id).order_by(Sale.sale_date.desc()).all()

        return make_response_data(data=[sale.to_dict() for sale in sales], message="Sales fetched successfully.")

    @role_required('seller')
    def post(self):
        data = parser.parse_args()
        current_user = get_current_user()

        try:
            sale_date = datetime.strptime(data['sale_date'], '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format for sale_date. Use YYYY-MM-DD.", status_code=400)

        new_sale = Sale(
            seller_id=current_user.id,
            assignment=data['assignment'],
            fruit_type=data['fruit_type'],
            quantity=data['quantity'],
            revenue=data['revenue'],
            sale_date=sale_date
        )
        db.session.add(new_sale)
        db.session.commit()
        return make_response_data(data=new_sale.to_dict(), message="Sale recorded successfully.", status_code=201)

class SalesResource(Resource):
    @role_required('ceo') # Only CEO can edit/delete sales records
    def put(self, sale_id):
        sale = Sale.query.get_or_404(sale_id)
        data = parser.parse_args()

        sale.assignment = data['assignment']
        sale.fruit_type = data['fruit_type']
        sale.quantity = data['quantity']
        sale.revenue = data['revenue']
        sale.sale_date = datetime.strptime(data['sale_date'], '%Y-%m-%d').date()

        db.session.commit()
        return make_response_data(data=sale.to_dict(), message="Sale record updated.")

    @role_required('ceo')
    def delete(self, sale_id):
        sale = Sale.query.get_or_404(sale_id)
        db.session.delete(sale)
        db.session.commit()
        return make_response_data(message="Sale record deleted.")

class ClearSalesResource(Resource):
    @role_required('ceo')
    def delete(self):
        num_deleted = Sale.query.delete()
        db.session.commit()
        return make_response_data(message=f"Successfully cleared {num_deleted} sales records.")

class SalesSummaryResource(Resource):
    @role_required('ceo')
    def get(self):
        total_revenue = db.session.query(func.sum(Sale.revenue)).scalar() or 0
        sales_by_fruit = db.session.query(Sale.fruit_type, func.sum(Sale.revenue)).group_by(Sale.fruit_type).all()

        summary = {
            'total_revenue': total_revenue,
            'revenue_by_fruit': [{'fruit_type': fruit, 'total_revenue': revenue} for fruit, revenue in sales_by_fruit]
        }
        return make_response_data(data=summary, message="Sales summary fetched.")

class DailySalesReportResource(Resource):
    @role_required('ceo')
    def get(self, date_str):
        try:
            report_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return make_response_data(success=False, message="Invalid date format. Use YYYY-MM-DD.", status_code=400)

        # Get all sales for the specified date
        sales = Sale.query.filter_by(sale_date=report_date).all()

        if not sales:
            return make_response_data(success=False, message=f"No sales found for {date_str}.", status_code=404)

        # Create PDF buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title = Paragraph(f"Daily Sales Report - {report_date.strftime('%B %d, %Y')}", styles['Title'])
        elements.append(title)
        elements.append(Spacer(1, 12))

        # Summary
        total_revenue = sum(sale.revenue for sale in sales)
        total_quantity = sum(float(sale.quantity) for sale in sales)
        summary_text = f"Total Sales: {len(sales)} | Total Quantity: {total_quantity:.2f} | Total Revenue: KES {total_revenue:,.2f}"
        summary = Paragraph(summary_text, styles['Normal'])
        elements.append(summary)
        elements.append(Spacer(1, 12))

        # Table data
        data = [['Date', 'Seller', 'Fruit Type', 'Quantity', 'Revenue']]
        for sale in sales:
            data.append([
                sale.sale_date.strftime('%Y-%m-%d'),
                sale.seller_name or 'N/A',
                sale.fruit_type,
                sale.quantity,
                f'KES {sale.revenue:,.2f}'
            ])

        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))

        elements.append(table)

        # Build PDF
        doc.build(elements)
        buffer.seek(0)

        return send_file(
            buffer,
            as_attachment=True,
            download_name=f"sales_report_{date_str}.pdf",
            mimetype='application/pdf'
        )

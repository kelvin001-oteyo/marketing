export function Products() {
    return <Page title="Products" />;
}

export function Categories() {
    return <Page title="Categories" />;
}

export function Sellers() {
    return <Page title="Sellers" />;
}

export function Customers() {
    return <Page title="Customers" />;
}

export function Inventory() {
    return <Page title="Inventory" />;
}

export function Orders() {
    return <Page title="Orders" />;
}

export function Promotions() {
    return <Page title="Promotions" />;
}

export function Reviews() {
    return <Page title="Reviews" />;
}

export function Notifications() {
    return <Page title="Notifications" />;
}

export function Reports() {
    return <Page title="Reports" />;
}

export function Settings() {
    return <Page title="Store Settings" />;
}

function Page({ title }) {
    return (
        <div>
            <h1>{title}</h1>
            <p>
                This management section is ready
                for implementation.
            </p>
        </div>
    );
}